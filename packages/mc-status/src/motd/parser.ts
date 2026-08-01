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

export function normalizeMotdText(input: string): string {
  if (!input) return '';

  let text = input.replace(/\\u00a7/gi, '§');

  // 1. Convert HTML tags to § formatting codes
  text = text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(
      /<span[^>]*style="[^"]*color:\s*#([0-9a-fA-F]{6})[^"]*"[^>]*>/gi,
      '§#$1'
    )
    .replace(
      /<span[^>]*style="[^"]*color:\s*rgb\((\d+),\s*(\d+),\s*(\d+)\)[^"]*"[^>]*>/gi,
      (_, r, g, b) => {
        const hex = [r, g, b]
          .map((x) =>
            Math.min(255, Math.max(0, parseInt(x, 10)))
              .toString(16)
              .padStart(2, '0')
          )
          .join('');
        return `§#${hex}`;
      }
    )
    .replace(
      /<span[^>]*class="[^"]*motd-color-([0-9a-fA-F]{6})[^"]*"[^>]*>/gi,
      '§#$1'
    )
    .replace(/<span[^>]*style="[^"]*font-weight:\s*bold[^"]*"[^>]*>/gi, '§l')
    .replace(/<span[^>]*style="[^"]*font-style:\s*italic[^"]*"[^>]*>/gi, '§o')
    .replace(/<\/span>/gi, '§r')
    .replace(/<[^>]+>/g, (tag) => {
      const hexMatch = tag.match(/^<(?:color:|c:)?#([0-9a-fA-F]{6})>$/i);
      if (hexMatch) return `§#${hexMatch[1]}`;

      const miniMsgTags: Record<string, string> = {
        '</color>': '§r',
        '<reset>': '§r',
        '<r>': '§r',
        '<bold>': '§l',
        '<b>': '§l',
        '<italic>': '§o',
        '<i>': '§o',
        '<underlined>': '§n',
        '<u>': '§n',
        '<strikethrough>': '§m',
        '<st>': '§m',
        '<obfuscated>': '§k',
        '<obf>': '§k',
      };
      const lower = tag.toLowerCase();
      if (lower in miniMsgTags) return miniMsgTags[lower];
      return '';
    });

  // 2. Spread hex: &x&1&2&3&4&5&6 or §x§1§2§3§4§5§6 -> §#123456
  text = text.replace(
    /[&§]x[&§]([0-9a-fA-F])[&§]([0-9a-fA-F])[&§]([0-9a-fA-F])[&§]([0-9a-fA-F])[&§]([0-9a-fA-F])[&§]([0-9a-fA-F])/gi,
    '§#$1$2$3$4$5$6'
  );

  // 3. Compact x hex: &x123456 or §x123456 -> §#123456
  text = text.replace(/[&§]x([0-9a-fA-F]{6})/gi, '§#$1');

  // 4. Ampersand hash hex: &#123456 -> §#123456
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
  let isExplicit = hasExplicitColor || isCustomHexColor(initialStyle.color);
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
      style = {
        ...style,
        color: hexColor,
      };
      isExplicit = true;
      i += 7;
      continue;
    }

    const lower = next.toLowerCase();
    if (lower in COLOR_BY_CODE) {
      flush();
      // If we already have an explicit hex color, ignore 1.8 legacy fallback codes (§c, §a, etc.)
      if (!isExplicit) {
        style = { ...style, color: COLOR_BY_CODE[lower] };
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
        isExplicit = hasExplicitColor || isCustomHexColor(initialStyle.color);
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
  } else if (typeof input === 'object' && input !== null) {
    runs = parseChatComponent(input);
  } else if (Array.isArray(input)) {
    runs = parseChatComponent(input as (string | ChatComponent)[]);
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
