export interface MiniMessageNode {
  type: 'root' | 'tag' | 'text';
  id: number;
  value?: string;
  tagName?: string;
  params?: string[];
  children: MiniMessageNode[];
}

const MINIMESSAGE_COLOR_MAP: Record<string, string> = {
  black: '#000000',
  dark_blue: '#0000aa',
  dark_green: '#00aa00',
  dark_aqua: '#00aaaa',
  dark_red: '#aa0000',
  dark_purple: '#aa00aa',
  gold: '#ffaa00',
  gray: '#aaaaaa',
  dark_gray: '#555555',
  blue: '#5555ff',
  green: '#55ff55',
  aqua: '#55ffff',
  red: '#ff5555',
  light_purple: '#ff55ff',
  yellow: '#ffff55',
  white: '#ffffff',
};

function isColor(str: string): boolean {
  const clean = str.toLowerCase().replace(/_/g, '');
  if (MINIMESSAGE_COLOR_MAP[clean] !== undefined) {
    return true;
  }
  return /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(str);
}

function resolveColor(str: string): string | null {
  const clean = str.toLowerCase().replace(/_/g, '');
  if (MINIMESSAGE_COLOR_MAP[clean] !== undefined) {
    return MINIMESSAGE_COLOR_MAP[clean];
  }
  const hexMatch = str.match(/^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((char) => char + char)
        .join('');
    }
    return `#${hex.toLowerCase()}`;
  }
  return null;
}

function tokenize(input: string) {
  const tokens: Array<{ type: 'tag' | 'text'; value: string }> = [];
  let i = 0;
  while (i < input.length) {
    if (input[i] === '<') {
      if (i > 0 && input[i - 1] === '\\') {
        // escaped `<`
      } else {
        let j = i + 1;
        let escaped = false;
        while (j < input.length) {
          if (input[j] === '\\') {
            escaped = !escaped;
          } else if (input[j] === '>') {
            if (!escaped) {
              break;
            }
            escaped = false;
          } else {
            escaped = false;
          }
          j++;
        }
        if (j < input.length) {
          const tagContent = input.substring(i + 1, j);
          tokens.push({ type: 'tag', value: tagContent });
          i = j + 1;
          continue;
        }
      }
    }

    const start = i;
    while (i < input.length) {
      if (input[i] === '<') {
        if (i > 0 && input[i - 1] === '\\') {
          i++;
          continue;
        }
        break;
      }
      i++;
    }
    let textVal = input.substring(start, i);
    textVal = textVal.replace(/\\</g, '<').replace(/\\>/g, '>');
    tokens.push({ type: 'text', value: textVal });
  }
  return tokens;
}

let nodeIdCounter = 0;

function parseMiniMessage(
  tokens: Array<{ type: 'tag' | 'text'; value: string }>
): MiniMessageNode {
  nodeIdCounter = 0;
  const root: MiniMessageNode = {
    type: 'root',
    id: nodeIdCounter++,
    children: [],
  };
  const stack: MiniMessageNode[] = [root];

  for (const token of tokens) {
    if (token.type === 'text') {
      const textNode: MiniMessageNode = {
        type: 'text',
        id: nodeIdCounter++,
        value: token.value,
        children: [],
      };
      stack[stack.length - 1].children.push(textNode);
    } else if (token.type === 'tag') {
      const content = token.value.trim();
      const isClosing = content.startsWith('/') || content.startsWith('!');
      if (isClosing) {
        const tagName = content.slice(1).toLowerCase();
        let foundIndex = -1;
        if (tagName === '') {
          if (stack.length > 1) {
            foundIndex = stack.length - 1;
          }
        } else {
          for (let i = stack.length - 1; i >= 1; i--) {
            const currentTag = stack[i].tagName || '';
            const match =
              currentTag === tagName ||
              ((tagName === 'color' ||
                tagName === 'colour' ||
                tagName === 'c' ||
                isColor(tagName)) &&
                (currentTag === 'color' ||
                  currentTag === 'colour' ||
                  currentTag === 'c')) ||
              ((tagName === 'gradient' || tagName === 'g') &&
                (currentTag === 'gradient' || currentTag === 'g'));
            if (match) {
              foundIndex = i;
              break;
            }
          }
        }
        if (foundIndex !== -1) {
          stack.splice(foundIndex);
        }
      } else {
        const parts = content.split(':').map((p) => p.trim());
        const rawTagName = parts[0].toLowerCase();
        let tagName = rawTagName;
        let params = parts.slice(1);

        if (isColor(rawTagName)) {
          tagName = 'color';
          params = [rawTagName];
        }

        const node: MiniMessageNode = {
          type: 'tag',
          id: nodeIdCounter++,
          tagName,
          params,
          children: [],
        };

        stack[stack.length - 1].children.push(node);
        stack.push(node);
      }
    }
  }
  return root;
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [255, 255, 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    ((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b))
      .toString(16)
      .slice(1)
  );
}

function interpolateColor(
  c1: [number, number, number],
  c2: [number, number, number],
  ratio: number
): [number, number, number] {
  return [
    c1[0] + (c2[0] - c1[0]) * ratio,
    c1[1] + (c2[1] - c1[1]) * ratio,
    c1[2] + (c2[2] - c1[2]) * ratio,
  ];
}

export function decodeMiniMessage(input: string) {
  const tokens = tokenize(input);

  const hasColorTags = tokens.some((t) => {
    if (t.type !== 'tag') return false;
    const content = t.value.trim();
    if (content.startsWith('/') || content.startsWith('!')) return true;
    const parts = content.split(':').map((p) => p.trim());
    const rawTagName = parts[0].toLowerCase();
    if (isColor(rawTagName)) return true;
    if (
      [
        'color',
        'colour',
        'c',
        'gradient',
        'g',
        'bold',
        'b',
        'italic',
        'em',
        'i',
        'underlined',
        'underline',
        'u',
        'strikethrough',
        'st',
        'obfuscated',
        'obf',
      ].includes(rawTagName)
    )
      return true;
    return false;
  });

  if (!hasColorTags) {
    return null;
  }

  const root = parseMiniMessage(tokens);

  const spans: Array<{ text: string; activeTags: MiniMessageNode[] }> = [];
  function dfs(node: MiniMessageNode, activeTags: MiniMessageNode[]) {
    if (node.type === 'text' && node.value) {
      spans.push({ text: node.value, activeTags });
    } else if (node.type === 'tag' || node.type === 'root') {
      const nextActive =
        node.type === 'tag' ? [...activeTags, node] : activeTags;
      for (const child of node.children) {
        dfs(child, nextActive);
      }
    }
  }
  dfs(root, []);

  let currentIndex = 0;
  const spansWithIndices = spans.map((span) => {
    const start = currentIndex;
    const end = currentIndex + span.text.length;
    currentIndex = end;
    return { ...span, start, end };
  });

  const totalLength = currentIndex;
  const plainText = spans.map((s) => s.text).join('');

  const tagRanges = new Map<number, { start: number; end: number }>();
  for (const span of spansWithIndices) {
    for (const tag of span.activeTags) {
      const existing = tagRanges.get(tag.id);
      if (!existing) {
        tagRanges.set(tag.id, { start: span.start, end: span.end });
      } else {
        existing.end = span.end;
      }
    }
  }

  const charColors: Array<{ hex: string; pos: number }> = [];
  const charFormattings: Array<{
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    obfuscate?: boolean;
  }> = [];

  for (let i = 0; i < totalLength; i++) {
    const span = spansWithIndices.find((s) => i >= s.start && i < s.end);
    if (!span) continue;

    let resolvedHex = '#ffffff';

    for (let tIdx = span.activeTags.length - 1; tIdx >= 0; tIdx--) {
      const tag = span.activeTags[tIdx];
      if (
        tag.tagName === 'color' ||
        tag.tagName === 'colour' ||
        tag.tagName === 'c'
      ) {
        const hex =
          tag.params && tag.params[0] ? resolveColor(tag.params[0]) : null;
        if (hex) {
          resolvedHex = hex;
          break;
        }
      } else if (tag.tagName === 'gradient' || tag.tagName === 'g') {
        const gColors = tag.params
          ? tag.params
              .map((p) => resolveColor(p))
              .filter((c): c is string => c !== null)
          : [];
        if (gColors.length > 0) {
          if (gColors.length === 1) {
            resolvedHex = gColors[0];
          } else {
            const range = tagRanges.get(tag.id);
            if (range) {
              const gStart = range.start;
              const gEnd = range.end;
              const denom = gEnd - gStart - 1;
              const t = denom > 0 ? (i - gStart) / denom : 0;

              const idx = t * (gColors.length - 1);
              const low = Math.floor(idx);
              const high = Math.ceil(idx);
              const ratio = idx - low;

              const c1 = hexToRgb(gColors[low]);
              const c2 = hexToRgb(gColors[high]);
              const interpolated = interpolateColor(c1, c2, ratio);
              resolvedHex = rgbToHex(
                interpolated[0],
                interpolated[1],
                interpolated[2]
              );
            }
          }
          break;
        }
      }
    }

    charColors.push({
      hex: resolvedHex,
      pos: totalLength > 1 ? (100 / (totalLength - 1)) * i : 0,
    });

    const activeFmts: {
      bold?: boolean;
      italic?: boolean;
      underline?: boolean;
      strikethrough?: boolean;
      obfuscate?: boolean;
    } = {};

    for (const tag of span.activeTags) {
      const name = tag.tagName;
      if (name === 'bold' || name === 'b') activeFmts.bold = true;
      if (name === 'italic' || name === 'em' || name === 'i')
        activeFmts.italic = true;
      if (name === 'underlined' || name === 'underline' || name === 'u')
        activeFmts.underline = true;
      if (name === 'strikethrough' || name === 'st')
        activeFmts.strikethrough = true;
      if (name === 'obfuscated' || name === 'obf') activeFmts.obfuscate = true;
    }

    charFormattings.push(activeFmts);
  }

  return { plainText, charColors, charFormattings };
}
