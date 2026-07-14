function hexToHSL(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 100, s: 100, l: 100 };
  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0;
  let s,
    l = (max + min) / 2;
  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return { h, s, l };
}

export function getSignificantPoints(gradient: string[], threshold: number) {
  // Convert all colors to HSL
  const hslColors = gradient.map(hexToHSL);

  // Calculate differences between consecutive colors
  const differences = [];
  for (let i = 1; i < hslColors.length; i++) {
    const hDiff = Math.abs(hslColors[i].h - hslColors[i - 1].h);
    const sDiff = Math.abs(hslColors[i].s - hslColors[i - 1].s);
    const lDiff = Math.abs(hslColors[i].l - hslColors[i - 1].l);

    // Weight hue, saturation, and lightness changes
    differences.push({
      index: i,
      change: hDiff * 2 + sDiff + lDiff, // Hue changes weighted more heavily
    });
  }

  // Identify significant points based on notable changes
  const significantPoints = [gradient[0]]; // Always include the first color

  // Iterate over differences to capture significant transitions
  for (let i = 1; i < differences.length; i++) {
    if (differences[i - 1].change > threshold) {
      // Dynamic threshold based on gradient characteristics
      significantPoints.push(gradient[differences[i - 1].index]);
    }
  }

  significantPoints.push(gradient[gradient.length - 1]); // Always include the last color

  return significantPoints;
}

export function decodeLegacy(rgbtext: string) {
  const legacyCodeRegex =
    /(?:(?:[&§]|\\u00a7)x(?:(?:[&§]|\\u00a7)[0-9A-Fa-f]){6}|&#[0-9A-Fa-f]{6}|(?:[&§]|\\u00a7)[l-orL-ORkK])/g;
  const matches = [...rgbtext.matchAll(legacyCodeRegex)];
  if (matches.length === 0) return null;

  const colors: Array<{ hex: string; pos: number }> = [];
  const charFormattings: Array<{
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    obfuscate?: boolean;
  }> = [];
  let plainText = '';

  let currentColor = '#ffffff';
  const currentFmts = {
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    obfuscate: false,
  };

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const codeStr = match[0];

    const lastChar = codeStr.charAt(codeStr.length - 1).toLowerCase();
    if (codeStr.length === 2 || codeStr.startsWith('\\u00a7')) {
      if (lastChar === 'r') {
        currentColor = '#ffffff';
        currentFmts.bold = false;
        currentFmts.italic = false;
        currentFmts.underline = false;
        currentFmts.strikethrough = false;
        currentFmts.obfuscate = false;
      } else if (lastChar === 'l') {
        currentFmts.bold = true;
      } else if (lastChar === 'o') {
        currentFmts.italic = true;
      } else if (lastChar === 'n') {
        currentFmts.underline = true;
      } else if (lastChar === 'm') {
        currentFmts.strikethrough = true;
      } else if (lastChar === 'k') {
        currentFmts.obfuscate = true;
      }
    } else {
      if (codeStr.startsWith('&#')) {
        currentColor = '#' + codeStr.slice(2);
      } else {
        const hexDigits = codeStr.replace(/(?:[&§]|\\u00a7|x)/g, '');
        currentColor = '#' + hexDigits;
      }
      currentFmts.bold = false;
      currentFmts.italic = false;
      currentFmts.underline = false;
      currentFmts.strikethrough = false;
      currentFmts.obfuscate = false;
    }

    const startIdx = match.index + codeStr.length;
    const endIdx =
      i + 1 < matches.length ? matches[i + 1].index : rgbtext.length;
    const textSegment = rgbtext.substring(startIdx, endIdx);

    for (let c = 0; c < textSegment.length; c++) {
      colors.push({
        hex: currentColor.toLowerCase(),
        pos: 0,
      });
      charFormattings.push({ ...currentFmts });
    }
    plainText += textSegment;
  }

  const totalLength = colors.length;
  for (let i = 0; i < totalLength; i++) {
    colors[i].pos = totalLength > 1 ? (100 / (totalLength - 1)) * i : 0;
  }

  return { plainText, colors, charFormattings };
}

export function buildFormatSegments(
  charFormattings: Array<{
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    obfuscate?: boolean;
  }>
) {
  const segments: Array<{
    start: number;
    end: number;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    obfuscate?: boolean;
  }> = [];
  let currentFmt: (typeof charFormattings)[0] | null = null;
  let startIdx = -1;

  for (let i = 0; i < charFormattings.length; i++) {
    const fmt = charFormattings[i];
    const isSame =
      currentFmt &&
      !!currentFmt.bold === !!fmt.bold &&
      !!currentFmt.italic === !!fmt.italic &&
      !!currentFmt.underline === !!fmt.underline &&
      !!currentFmt.strikethrough === !!fmt.strikethrough &&
      !!currentFmt.obfuscate === !!fmt.obfuscate;

    if (!isSame) {
      if (
        currentFmt &&
        (currentFmt.bold ||
          currentFmt.italic ||
          currentFmt.underline ||
          currentFmt.strikethrough ||
          currentFmt.obfuscate)
      ) {
        segments.push({
          start: startIdx,
          end: i,
          ...(currentFmt.bold && { bold: true }),
          ...(currentFmt.italic && { italic: true }),
          ...(currentFmt.underline && { underline: true }),
          ...(currentFmt.strikethrough && { strikethrough: true }),
          ...(currentFmt.obfuscate && { obfuscate: true }),
        });
      }
      startIdx = i;
      currentFmt = fmt;
    }
  }

  if (
    currentFmt &&
    (currentFmt.bold ||
      currentFmt.italic ||
      currentFmt.underline ||
      currentFmt.strikethrough ||
      currentFmt.obfuscate)
  ) {
    segments.push({
      start: startIdx,
      end: charFormattings.length,
      ...(currentFmt.bold && { bold: true }),
      ...(currentFmt.italic && { italic: true }),
      ...(currentFmt.underline && { underline: true }),
      ...(currentFmt.strikethrough && { strikethrough: true }),
      ...(currentFmt.obfuscate && { obfuscate: true }),
    });
  }

  return segments;
}
