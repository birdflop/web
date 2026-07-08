import { hexToRGB, rgbToHex } from './Hex';

// ============================================================================
// HSL Color Space Utilities
// ============================================================================

/**
 * Represents a color in the HSL color space
 * HSL (Hue, Saturation, Lightness) is intuitive for color manipulation
 */
export interface HSL {
  h: number; // Hue (0-360 degrees)
  s: number; // Saturation (0-100%)
  l: number; // Lightness (0-100%)
}

/**
 * Represents a color in the HSV color space
 * HSV (Hue, Saturation, Value) is also known as HSB (Hue, Saturation, Brightness)
 */
export interface HSV {
  h: number; // Hue (0-360 degrees)
  s: number; // Saturation (0-100%)
  v: number; // Value/Brightness (0-100%)
}

/**
 * Converts RGB (0-255 range) to HSL color space
 * @param rgb - RGB array [r, g, b] with values in 0-255 range
 * @returns HSL color
 */
export function rgbToHsl(rgb: number[]): HSL {
  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / delta + 2) / 6;
        break;
      case b:
        h = ((r - g) / delta + 4) / 6;
        break;
    }
  }

  return {
    h: h * 360,
    s: s * 100,
    l: l * 100,
  };
}

/**
 * Converts HSL to RGB (0-255 range)
 * @param hsl - HSL color
 * @returns RGB array [r, g, b] with values in 0-255 range
 */
export function hslToRgb(hsl: HSL): number[] {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Converts hex color to HSL color space
 * @param hex - Hex color string (e.g., "#FF5733")
 * @returns HSL color
 */
export function hexToHsl(hex: string): HSL {
  const rgb = hexToRGB(hex);
  return rgbToHsl(rgb);
}

/**
 * Converts HSL to hex color
 * @param hsl - HSL color
 * @returns Hex color string (e.g., "FF5733")
 */
export function hslToHex(hsl: HSL): string {
  const rgb = hslToRgb(hsl);
  return rgbToHex(rgb);
}

/**
 * Linearly interpolates between two HSL colors
 * Handles hue interpolation properly (shortest path around the color wheel)
 * @param color1 - First HSL color
 * @param color2 - Second HSL color
 * @param factor - Interpolation factor (0 = color1, 1 = color2)
 * @returns Interpolated HSL color
 */
export function interpolateHsl(color1: HSL, color2: HSL, factor: number): HSL {
  // Interpolate S and L linearly
  const s = color1.s + (color2.s - color1.s) * factor;
  const l = color1.l + (color2.l - color1.l) * factor;

  // Interpolate hue using shortest path around the color wheel
  const h1 = color1.h;
  const h2 = color2.h;
  let hDiff = h2 - h1;

  // Choose shortest path around the circle
  if (hDiff > 180) {
    hDiff -= 360;
  } else if (hDiff < -180) {
    hDiff += 360;
  }

  let h = h1 + hDiff * factor;
  if (h < 0) h += 360;
  if (h >= 360) h -= 360;

  return { h, s, l };
}

// ============================================================================
// HSV Color Space Utilities
// ============================================================================

/**
 * Converts RGB (0-255 range) to HSV color space
 * @param rgb - RGB array [r, g, b] with values in 0-255 range
 * @returns HSV color
 */
export function rgbToHsv(rgb: number[]): HSV {
  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  const s = max === 0 ? 0 : delta / max;
  const v = max;

  if (delta !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / delta + 2) / 6;
        break;
      case b:
        h = ((r - g) / delta + 4) / 6;
        break;
    }
  }

  return {
    h: h * 360,
    s: s * 100,
    v: v * 100,
  };
}

/**
 * Converts HSV to RGB (0-255 range)
 * @param hsv - HSV color
 * @returns RGB array [r, g, b] with values in 0-255 range
 */
export function hsvToRgb(hsv: HSV): number[] {
  const h = hsv.h / 360;
  const s = hsv.s / 100;
  const v = hsv.v / 100;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  let r: number, g: number, b: number;

  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
    default:
      r = g = b = 0;
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Converts hex color to HSV color space
 * @param hex - Hex color string (e.g., "#FF5733")
 * @returns HSV color
 */
export function hexToHsv(hex: string): HSV {
  const rgb = hexToRGB(hex);
  return rgbToHsv(rgb);
}

/**
 * Converts HSV to hex color
 * @param hsv - HSV color
 * @returns Hex color string (e.g., "FF5733")
 */
export function hsvToHex(hsv: HSV): string {
  const rgb = hsvToRgb(hsv);
  return rgbToHex(rgb);
}

/**
 * Linearly interpolates between two HSV colors
 * Handles hue interpolation properly (shortest path around the color wheel)
 * @param color1 - First HSV color
 * @param color2 - Second HSV color
 * @param factor - Interpolation factor (0 = color1, 1 = color2)
 * @returns Interpolated HSV color
 */
export function interpolateHsv(color1: HSV, color2: HSV, factor: number): HSV {
  // Interpolate S and V linearly
  const s = color1.s + (color2.s - color1.s) * factor;
  const v = color1.v + (color2.v - color1.v) * factor;

  // Interpolate hue using shortest path around the color wheel
  const h1 = color1.h;
  const h2 = color2.h;
  let hDiff = h2 - h1;

  // Choose shortest path around the circle
  if (hDiff > 180) {
    hDiff -= 360;
  } else if (hDiff < -180) {
    hDiff += 360;
  }

  let h = h1 + hDiff * factor;
  if (h < 0) h += 360;
  if (h >= 360) h -= 360;

  return { h, s, v };
}

// ============================================================================
// Conversion Utilities between HSL and HSV
// ============================================================================

/**
 * Converts HSL to HSV
 * @param hsl - HSL color
 * @returns HSV color
 */
export function hslToHsv(hsl: HSL): HSV {
  const h = hsl.h;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  const v = l + s * Math.min(l, 1 - l);
  const sv = v === 0 ? 0 : 2 * (1 - l / v);

  return {
    h,
    s: sv * 100,
    v: v * 100,
  };
}

/**
 * Converts HSV to HSL
 * @param hsv - HSV color
 * @returns HSL color
 */
export function hsvToHsl(hsv: HSV): HSL {
  const h = hsv.h;
  const s = hsv.s / 100;
  const v = hsv.v / 100;

  const l = v * (1 - s / 2);
  const sl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);

  return {
    h,
    s: sl * 100,
    l: l * 100,
  };
}
