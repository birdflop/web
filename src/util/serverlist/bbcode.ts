// Minimal, safe BBCode -> HTML renderer for server descriptions.
//
// Why BBCode: it's the long-standing convention on Minecraft server-list /
// voting sites, so owners can paste descriptions they already have, and it's
// safe to render because we map a fixed, known tag set to known-safe HTML
// rather than letting user HTML/markdown through.
//
// Safety model: the raw input is parsed ONCE into a tree (a single left-to-
// right scan with a tag stack), and the tree is rendered with every text node
// HTML-escaped. Generated HTML is never re-scanned, so stripped or invalid
// tags can't reassemble into new markup in a later pass. Every attribute is
// validated (URLs must be http/https with no quotes/brackets/whitespace,
// colors and sizes must match strict patterns); a tag whose attribute fails
// validation, or that is never closed, is rendered as its literal (escaped)
// source text.

const ESCAPE: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (c) => ESCAPE[c]);
}

// Validate a raw URL: only http/https, and none of the characters that could
// break out of (or confuse) an attribute or BBCode context.
function safeUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!/^https?:\/\/[^\s"'<>[\]`\\]+$/i.test(trimmed)) return null;
  return trimmed;
}

// Validate a color token: hex (#rgb..#rrggbbaa) or a plain CSS color name.
function safeColor(color: string): string | null {
  const trimmed = color.trim();
  if (/^#[0-9a-fA-F]{3,8}$/.test(trimmed)) return trimmed;
  if (/^[a-zA-Z]{1,20}$/.test(trimmed)) return trimmed.toLowerCase();
  return null;
}

// Clamp a [size=N] value to a small px range.
function safeSize(size: string): string | null {
  const n = parseInt(size.trim(), 10);
  if (!Number.isFinite(n)) return null;
  return `${Math.min(32, Math.max(10, n))}px`;
}

// Tags whose content may contain further tags.
const CONTAINER_TAGS = new Set([
  'b',
  'i',
  'u',
  's',
  'center',
  'quote',
  'color',
  'size',
  'url',
  'list',
]);
// Tags whose content is taken verbatim up to the matching close tag
// ([url] only when it has no =href, see below).
const RAW_TAGS = new Set(['code', 'img', 'url']);

// Deeper nesting than this is rendered literally; no real description needs it.
const MAX_DEPTH = 32;

interface ElementNode {
  tag: string;
  // Validated attribute value (url/color/size), already safe to emit.
  attr?: string;
  // Literal source of the opening tag, used if it ends up unclosed.
  source: string;
  children: Node[];
}

// '*' is a list-item marker, only produced directly inside a [list].
type Node = string | ElementNode | { tag: '*' };

const TAG_RE = /\[(\/?)([a-z]+|\*)(?:=([^\]]*))?\]/gi;

function parse(input: string): Node[] {
  const root: ElementNode = { tag: '', source: '', children: [] };
  const stack: ElementNode[] = [root];
  const top = () => stack[stack.length - 1];
  const pushText = (text: string) => {
    if (!text) return;
    const children = top().children;
    const last = children[children.length - 1];
    if (typeof last === 'string') children[children.length - 1] = last + text;
    else children.push(text);
  };
  // Unwind an unclosed element into its parent as literal text + children.
  const unwind = () => {
    const el = stack.pop()!;
    pushText(el.source);
    for (const child of el.children) {
      if (typeof child === 'string') pushText(child);
      else if (!('children' in child)) pushText('[*]');
      else top().children.push(child);
    }
  };

  let pos = 0;
  TAG_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = TAG_RE.exec(input))) {
    const [source, slash, rawName, attr] = m;
    const name = rawName.toLowerCase();
    pushText(input.slice(pos, m.index));
    pos = m.index + source.length;

    if (slash) {
      // Close the nearest matching open element; anything opened above it
      // was never closed and falls back to literal text.
      let idx = stack.length - 1;
      while (idx > 0 && stack[idx].tag !== name) idx--;
      if (attr !== undefined || idx === 0) {
        pushText(source);
        continue;
      }
      while (stack.length - 1 > idx) unwind();
      const el = stack.pop()!;
      top().children.push(el);
      continue;
    }

    if (name === '*') {
      if (attr === undefined && top().tag === 'list')
        top().children.push({ tag: '*' });
      else pushText(source);
      continue;
    }

    // Raw-content tags: take everything up to the matching close tag as-is.
    if (RAW_TAGS.has(name) && attr === undefined) {
      const close = `[/${name}]`;
      const end = input.toLowerCase().indexOf(close, pos);
      if (end === -1) {
        pushText(source);
        continue;
      }
      const content = input.slice(pos, end);
      const full = source + content + input.slice(end, end + close.length);
      pos = end + close.length;
      TAG_RE.lastIndex = pos;
      if (name === 'code') {
        top().children.push({ tag: 'code', source, children: [content] });
        continue;
      }
      const url = safeUrl(content);
      if (!url) pushText(full);
      else top().children.push({ tag: name, attr: url, source, children: [] });
      continue;
    }

    if (!CONTAINER_TAGS.has(name) || stack.length > MAX_DEPTH) {
      pushText(source);
      continue;
    }

    // Validate the attribute up front: a tag with a missing or invalid one
    // keeps its literal markup (and so will its now-unmatched close tag).
    let value: string | null | undefined;
    if (name === 'color') value = attr === undefined ? null : safeColor(attr);
    else if (name === 'size')
      value = attr === undefined ? null : safeSize(attr);
    else if (name === 'url') value = safeUrl(attr ?? '');
    else value = attr === undefined ? undefined : null;
    if (value === null) {
      pushText(source);
      continue;
    }

    stack.push({ tag: name, attr: value, source, children: [] });
  }
  pushText(input.slice(pos));
  while (stack.length > 1) unwind();
  return root.children;
}

const LINK_ATTRS = 'target="_blank" rel="noopener noreferrer nofollow"';

function renderNodes(nodes: Node[]): string {
  return nodes.map(renderNode).join('');
}

function renderList(children: Node[]): string {
  // Split on [*] markers; empty items (e.g. whitespace before the first
  // marker) are dropped.
  const items: Node[][] = [[]];
  for (const child of children) {
    if (typeof child !== 'string' && child.tag === '*') items.push([]);
    else items[items.length - 1].push(child);
  }
  return `<ul>${items
    .map((item) => renderNodes(item).trim())
    .filter(Boolean)
    .map((item) => `<li>${item}</li>`)
    .join('')}</ul>`;
}

function renderNode(node: Node): string {
  if (typeof node === 'string') return escapeHtml(node);
  if (!('children' in node)) return '';
  const inner = () => renderNodes(node.children);
  const attr = escapeHtml(node.attr ?? '');
  switch (node.tag) {
    case 'b':
      return `<strong>${inner()}</strong>`;
    case 'i':
      return `<em>${inner()}</em>`;
    case 'u':
      return `<u>${inner()}</u>`;
    case 's':
      return `<s>${inner()}</s>`;
    case 'center':
      return `<div style="text-align:center">${inner()}</div>`;
    case 'quote':
      return `<blockquote>${inner()}</blockquote>`;
    case 'code':
      return `<code>${inner()}</code>`;
    case 'color':
      return `<span style="color:${attr}">${inner()}</span>`;
    case 'size':
      return `<span style="font-size:${attr}">${inner()}</span>`;
    case 'url':
      return `<a href="${attr}" ${LINK_ATTRS}>${node.children.length ? inner() : attr}</a>`;
    case 'img':
      return `<img src="${attr}" alt="" style="max-width:100%;height:auto" loading="lazy" />`;
    case 'list':
      return renderList(node.children);
    default:
      return escapeHtml(node.source) + inner();
  }
}

/**
 * Render BBCode to a safe HTML string suitable for dangerouslySetInnerHTML.
 */
export function renderBBCode(input: string): string {
  if (!input) return '';
  let html = renderNodes(parse(input));

  // Newlines -> <br> (but not right after block elements, to avoid doubles).
  // Safe on the rendered string: text is escaped and no emitted attribute
  // can contain a newline.
  html = html.replace(/\r?\n/g, '<br />');
  html = html.replace(/(<\/(?:div|blockquote|ul|li)>)<br \/>/g, '$1');

  return html;
}

/**
 * Strip all BBCode tags to plain text (for list previews and meta tags).
 */
export function stripBBCode(input: string): string {
  if (!input) return '';
  return input
    .replace(/\[\/?[a-z]+(=[^\]]+)?\]/gi, '')
    .replace(/\[\*\]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
