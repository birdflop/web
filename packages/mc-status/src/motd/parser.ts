import type {
  ChatComponent,
  MotdResult,
  MotdRun,
  MotdStyle,
} from '../types.js';
import {
  COLOR_BY_CODE,
  MC_COLORS,
  normalizeHexColor,
  shadowColor,
} from './colors.js';

const LEGACY_HEX_SET = new Set(MC_COLORS.map((c) => c.hex.toUpperCase()));

export function isCustomHexColor(color: string): boolean {
  if (!color || !color.startsWith('#')) return false;
  const upper = color.toUpperCase();
  return upper.length === 7 && !LEGACY_HEX_SET.has(upper);
}

export function defaultStyle(): MotdStyle {
  return {
    color: '#FFFFFF',
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    obfuscated: false,
  };
}

// MiniMessage tags we translate to section codes. Anything else in angle
// brackets is left untouched so ordinary text like `<<< Welcome >>>` survives.
const MINIMESSAGE_TAGS: Record<string, string> = {
  '</color>': '§r',
  '<reset>': '§r',
  '<r>': '§r',
  '<bold>': '§l',
  '<b>': '§l',
  '<italic>': '§o',
  '<i>': '§o',
  '<em>': '§o',
  '<underlined>': '§n',
  '<u>': '§n',
  '<strikethrough>': '§m',
  '<st>': '§m',
  '<obfuscated>': '§k',
  '<obf>': '§k',
};
const MINIMESSAGE_HEX_RE = /<(?:color:|c:)?#([0-9a-fA-F]{6})>/gi;
const MINIMESSAGE_TAG_RE = new RegExp(
  Object.keys(MINIMESSAGE_TAGS).join('|'),
  'gi'
);
// Only treat input as HTML when it actually contains the markup we produce
// (motdRunsToHtml / mcstatus.io style spans or line breaks).
const HTML_RE = /<span\b[^>]*>|<\/span>|<br\s*\/?>/i;

function rgbToHex(r: string, g: string, b: string): string {
  return [r, g, b]
    .map((x) =>
      Math.min(255, Math.max(0, parseInt(x, 10)))
        .toString(16)
        .padStart(2, '0')
    )
    .join('');
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

function htmlToSection(input: string): string {
  const text = input
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<span\b([^>]*)>/gi, (_, attrs: string) => {
      let codes = '';
      const hex =
        /color:\s*#([0-9a-fA-F]{6})/i.exec(attrs)?.[1] ??
        /motd-color-([0-9a-fA-F]{6})/i.exec(attrs)?.[1];
      const rgb = /color:\s*rgb\((\d+),\s*(\d+),\s*(\d+)\)/i.exec(attrs);
      if (hex) codes += `§#${hex}`;
      else if (rgb) codes += `§#${rgbToHex(rgb[1], rgb[2], rgb[3])}`;
      if (/font-weight:\s*bold/i.test(attrs)) codes += '§l';
      if (/font-style:\s*italic/i.test(attrs)) codes += '§o';
      if (/text-decoration:[^;"]*underline/i.test(attrs)) codes += '§n';
      if (/text-decoration:[^;"]*line-through/i.test(attrs)) codes += '§m';
      if (/motd-obfuscated/i.test(attrs)) codes += '§k';
      return codes;
    })
    .replace(/<\/span>/gi, '§r')
    // Any other markup is not part of the MOTD text.
    .replace(/<\/?[a-z][^>]*>/gi, '');
  return decodeHtmlEntities(text);
}

/**
 * Normalize an MOTD string (legacy §/& codes, spread/compact hex, MiniMessage
 * subset, or the HTML produced by motdRunsToHtml) into `§` codes with hex
 * colors written as `§#RRGGBB`. HTML handling only kicks in when the input
 * actually contains span/br markup; unknown `<...>` sequences are kept as
 * literal text.
 */
export function normalizeMotdText(input: string): string {
  if (!input) return '';

  let text = input.replace(/\\u00a7/gi, '§');

  if (HTML_RE.test(text)) {
    text = htmlToSection(text);
  } else if (text.includes('<')) {
    text = text
      .replace(MINIMESSAGE_HEX_RE, '§#$1')
      .replace(
        MINIMESSAGE_TAG_RE,
        (tag) => MINIMESSAGE_TAGS[tag.toLowerCase()]
      );
  }

  // Spread hex: &x&1&2&3&4&5&6 or §x§1§2§3§4§5§6 -> §#123456
  text = text.replace(
    /[&§]x[&§]([0-9a-fA-F])[&§]([0-9a-fA-F])[&§]([0-9a-fA-F])[&§]([0-9a-fA-F])[&§]([0-9a-fA-F])[&§]([0-9a-fA-F])/gi,
    '§#$1$2$3$4$5$6'
  );

  // Compact x hex: &x123456 or §x123456 -> §#123456
  text = text.replace(/[&§]x([0-9a-fA-F]{6})/gi, '§#$1');

  // Ampersand hash hex: &#123456 -> §#123456
  text = text.replace(/&#([0-9a-fA-F]{6})/gi, '§#$1');

  return text;
}

export function parseMotdLine(
  rawLine: string,
  initialStyle: MotdStyle = defaultStyle(),
  hasExplicitColor = false
): MotdRun[] {
  const line = normalizeMotdText(rawLine);
  const runs: MotdRun[] = [];
  let style = { ...initialStyle };
  // Only an explicit color inherited from a JSON component locks the color;
  // hex codes inside the line itself never do.
  const isExplicit = hasExplicitColor || isCustomHexColor(initialStyle.color);
  let buffer = '';

  const flush = () => {
    if (buffer) {
      runs.push({ text: buffer, style: { ...style } });
      buffer = '';
    }
  };

  const chars = Array.from(line);
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    const isCodeChar = c === '&' || c === '§';
    if (!isCodeChar || i + 1 >= chars.length) {
      buffer += c;
      continue;
    }

    const next = chars[i + 1];

    // Hex: &#RRGGBB
    if (
      next === '#' &&
      /^[0-9a-fA-F]{6}$/.test(chars.slice(i + 2, i + 8).join(''))
    ) {
      flush();
      const hexColor =
        '#' +
        chars
          .slice(i + 2, i + 8)
          .join('')
          .toUpperCase();
      // Like a legacy color code, a hex color resets active formatting.
      // It does not lock the color: a later legacy code still applies.
      style = { ...defaultStyle(), color: hexColor };
      i += 7;
      continue;
    }

    const lower = next.toLowerCase();
    if (lower in COLOR_BY_CODE) {
      flush();
      // Inside a JSON component that sets its own color, legacy codes in the
      // text are 1.8 fallbacks (§c, §a, ...) for old clients — keep the
      // component color. Otherwise a color code sets the color and, as in
      // Minecraft, resets bold/italic/etc.
      if (!isExplicit) {
        style = { ...defaultStyle(), color: COLOR_BY_CODE[lower] };
      }
      i++;
      continue;
    }

    switch (lower) {
      case 'l':
        flush();
        style.bold = true;
        i++;
        continue;
      case 'o':
        flush();
        style.italic = true;
        i++;
        continue;
      case 'n':
        flush();
        style.underline = true;
        i++;
        continue;
      case 'm':
        flush();
        style.strikethrough = true;
        i++;
        continue;
      case 'k':
        flush();
        style.obfuscated = true;
        i++;
        continue;
      case 'r':
        flush();
        style = { ...initialStyle };
        i++;
        continue;
    }

    buffer += c;
  }

  flush();
  return runs;
}

export function parseChatComponent(
  component: string | ChatComponent | (string | ChatComponent)[]
): MotdRun[][] {
  const lines: MotdRun[][] = [[]];

  function processComponent(
    comp: string | ChatComponent,
    parentStyle: MotdStyle
  ) {
    if (typeof comp === 'string') {
      const parsedLines = comp.split(/\r?\n/);
      parsedLines.forEach((lineText, idx) => {
        if (idx > 0) lines.push([]);
        if (lineText) {
          const lineRuns = parseMotdLine(lineText, parentStyle);
          const currentLine = lines[lines.length - 1];
          lineRuns.forEach((run) => {
            currentLine.push(run);
          });
        }
      });
      return;
    }

    if (!comp) return;

    const hasCompColor = Boolean(comp.color);
    const resolvedColor = comp.color
      ? (normalizeHexColor(comp.color) ?? parentStyle.color)
      : parentStyle.color;

    const currentStyle: MotdStyle = {
      color: resolvedColor,
      bold: comp.bold ?? parentStyle.bold,
      italic: comp.italic ?? parentStyle.italic,
      underline: comp.underlined ?? parentStyle.underline,
      strikethrough: comp.strikethrough ?? parentStyle.strikethrough,
      obfuscated: comp.obfuscated ?? parentStyle.obfuscated,
    };

    if (comp.text) {
      const textLines = comp.text.split(/\r?\n/);
      textLines.forEach((lineText, idx) => {
        if (idx > 0) lines.push([]);
        if (lineText) {
          const lineRuns = parseMotdLine(
            lineText,
            currentStyle,
            hasCompColor || isCustomHexColor(currentStyle.color)
          );
          const currentLine = lines[lines.length - 1];
          lineRuns.forEach((run) => {
            currentLine.push(run);
          });
        }
      });
    }

    if (Array.isArray(comp.extra)) {
      comp.extra.forEach((subComp) => processComponent(subComp, currentStyle));
    }
  }

  if (Array.isArray(component)) {
    component.forEach((item) => processComponent(item, defaultStyle()));
  } else {
    processComponent(component, defaultStyle());
  }

  return lines.filter((line) => line.length > 0);
}

export function motdRunsToHtml(lines: MotdRun[][]): string {
  return lines
    .map((line) =>
      line
        .map((run) => {
          const styles: string[] = [`color: ${run.style.color}`];
          if (run.style.bold) styles.push('font-weight: bold');
          if (run.style.italic) styles.push('font-style: italic');

          const decos: string[] = [];
          if (run.style.underline) decos.push('underline');
          if (run.style.strikethrough) decos.push('line-through');
          if (decos.length > 0)
            styles.push(`text-decoration: ${decos.join(' ')}`);

          const shadow = shadowColor(run.style.color);
          styles.push(`text-shadow: 2px 2px 0 ${shadow}`);

          const escapedText = run.text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');

          const className = run.style.obfuscated
            ? ' class="motd-obfuscated"'
            : '';

          return `<span style="${styles.join(';')}"${className}>${escapedText}</span>`;
        })
        .join('')
    )
    .join('\n');
}

export function motdRunsToRaw(lines: MotdRun[][]): string {
  return lines
    .map((line) =>
      line
        .map((run) => {
          let prefix = `§#${run.style.color.replace('#', '')}`;
          if (run.style.bold) prefix += '§l';
          if (run.style.italic) prefix += '§o';
          if (run.style.underline) prefix += '§n';
          if (run.style.strikethrough) prefix += '§m';
          if (run.style.obfuscated) prefix += '§k';
          return prefix + run.text;
        })
        .join('')
    )
    .join('\n');
}

export function motdRunsToClean(lines: MotdRun[][]): string {
  return lines.map((line) => line.map((run) => run.text).join('')).join('\n');
}

export function parseMotd(input: unknown): MotdResult {
  let runs: MotdRun[][];

  if (!input) {
    runs = [[]];
  } else if (Array.isArray(input)) {
    runs = parseChatComponent(input as (string | ChatComponent)[]);
  } else if (typeof input === 'object') {
    runs = parseChatComponent(input);
  } else if (typeof input === 'string') {
    const rawLines = input.split(/\r?\n/);
    runs = rawLines.map((l) => parseMotdLine(l));
  } else {
    runs = [[]];
  }

  return {
    raw: motdRunsToRaw(runs),
    clean: motdRunsToClean(runs),
    html: motdRunsToHtml(runs),
    runs,
  };
}
