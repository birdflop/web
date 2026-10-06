// Minimal, safe BBCode -> HTML renderer for server descriptions.
//
// Why BBCode: it's the long-standing convention on Minecraft server-list /
// voting sites, so owners can paste descriptions they already have, and it's
// safe to render because we map a fixed, known tag set to known-safe HTML
// rather than letting user HTML/markdown through.
//
// Safety model: ALL input is HTML-escaped first, so no raw markup can survive.
// We then convert a closed set of BBCode tags into a closed set of HTML tags,
// and validate every attribute (URLs must be http/https, colors must match a
// strict pattern). There is no path for user-controlled HTML or attributes.

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

// Validate a (already HTML-escaped) URL: only http/https, no quotes/spaces.
function safeUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!/^https?:\/\/[^\s"']+$/i.test(trimmed)) return null;
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

/**
 * Render BBCode to a safe HTML string suitable for dangerouslySetInnerHTML.
 */
export function renderBBCode(input: string): string {
  if (!input) return '';
  let html = escapeHtml(input);

  // Repeatedly apply inline replacements so nested tags resolve. A bounded
  // loop avoids pathological inputs while handling realistic nesting depth.
  const applyOnce = (s: string): string =>
    s
      // Simple formatting
      .replace(/\[b\]([\s\S]*?)\[\/b\]/gi, '<strong>$1</strong>')
      .replace(/\[i\]([\s\S]*?)\[\/i\]/gi, '<em>$1</em>')
      .replace(/\[u\]([\s\S]*?)\[\/u\]/gi, '<u>$1</u>')
      .replace(/\[s\]([\s\S]*?)\[\/s\]/gi, '<s>$1</s>')
      .replace(
        /\[center\]([\s\S]*?)\[\/center\]/gi,
        '<div style="text-align:center">$1</div>'
      )
      .replace(
        /\[quote\]([\s\S]*?)\[\/quote\]/gi,
        '<blockquote>$1</blockquote>'
      )
      .replace(/\[code\]([\s\S]*?)\[\/code\]/gi, '<code>$1</code>')
      // Color: [color=#fff] or [color=red]
      .replace(
        /\[color=([^\]]+)\]([\s\S]*?)\[\/color\]/gi,
        (m, color, text) => {
          const c = safeColor(color);
          return c ? `<span style="color:${c}">${text}</span>` : text;
        }
      )
      // Size: [size=16]
      .replace(/\[size=([^\]]+)\]([\s\S]*?)\[\/size\]/gi, (m, size, text) => {
        const sz = safeSize(size);
        return sz ? `<span style="font-size:${sz}">${text}</span>` : text;
      })
      // Links: [url=href]label[/url]
      .replace(/\[url=([^\]]+)\]([\s\S]*?)\[\/url\]/gi, (m, href, label) => {
        const u = safeUrl(href);
        return u
          ? `<a href="${u}" target="_blank" rel="noopener noreferrer nofollow">${label}</a>`
          : label;
      })
      // Links: [url]href[/url]
      .replace(/\[url\]([\s\S]*?)\[\/url\]/gi, (m, href) => {
        const u = safeUrl(href);
        return u
          ? `<a href="${u}" target="_blank" rel="noopener noreferrer nofollow">${u}</a>`
          : href;
      })
      // Images: [img]src[/img]
      .replace(/\[img\]([\s\S]*?)\[\/img\]/gi, (m, src) => {
        const u = safeUrl(src);
        return u
          ? `<img src="${u}" alt="" style="max-width:100%;height:auto" loading="lazy" />`
          : '';
      });

  for (let i = 0; i < 6; i++) {
    const next = applyOnce(html);
    if (next === html) break;
    html = next;
  }

  // Lists: [list] ... [*] item ... [/list]
  html = html.replace(/\[list\]([\s\S]*?)\[\/list\]/gi, (m, body) => {
    const items = body
      .split(/\[\*\]/)
      .map((s: string) => s.trim())
      .filter(Boolean)
      .map((s: string) => `<li>${s}</li>`)
      .join('');
    return `<ul>${items}</ul>`;
  });

  // Newlines -> <br> (but not right after block elements, to avoid doubles)
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
