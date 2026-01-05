export function hex(c: number) {
  const s = '0123456789ABCDEF';
  let i = c;
  if (i == 0 || isNaN(c)) { return '00'; }
  i = Math.round(Math.min(Math.max(0, i), 255));
  return s.charAt((i - i % 16) / 16) + s.charAt(i % 16);
}

export function rgbToHex(RGBAcolor: number[]) {
  return hex(RGBAcolor[0]) + hex(RGBAcolor[1]) + hex(RGBAcolor[2]);
}

export function trim(s: string) {
  return (s.charAt(0) == '#') ? s.substring(1, 7) : s;
}

/**
 * Converts a hex color string to RGB values
 * @param hex - Hex color string (e.g., '#FF00AA' or 'FF00AA')
 * @returns Tuple of [R, G, B] values (0-255)
 */
export function hexToRGB(hex: string): [number, number, number] {
  // Remove '#' if present
  const cleanHex = hex.replace('#', '');

  // Handle 3-character hex codes (e.g., 'FFF' -> 'FFFFFF')
  const fullHex = cleanHex.length === 3
    ? cleanHex.split('').map(char => char + char).join('')
    : cleanHex;

  const r = parseInt(fullHex.substring(0, 2), 16);
  const g = parseInt(fullHex.substring(2, 4), 16);
  const b = parseInt(fullHex.substring(4, 6), 16);

  return [r, g, b];
}

export function getBrightness(RGBAcolor: number[]) {
  return Math.sqrt(
    (RGBAcolor[0] * RGBAcolor[0] * 0.299) +
    (RGBAcolor[1] * RGBAcolor[1] * 0.587) +
    (RGBAcolor[2] * RGBAcolor[2] * 0.114),
  );
}

export function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// ============================================================================
// OKLAB Color Space Utilities
// ============================================================================

/**
 * Represents a color in the OKLAB color space
 * OKLAB is a perceptually uniform color space where Euclidean distance
 * corresponds to perceived color difference
 */
export interface OKLAB {
  L: number; // Lightness (0-1 typically)
  a: number; // Green-red axis
  b: number; // Blue-yellow axis
}

/**
 * Represents a color in linear RGB color space (0-1 range)
 */
export interface LinearRGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Converts sRGB (0-1 range) to linear RGB
 * Applies inverse gamma correction
 */
export function srgbToLinear(channel: number): number {
  if (channel <= 0.04045) {
    return channel / 12.92;
  }
  return Math.pow((channel + 0.055) / 1.055, 2.4);
}

/**
 * Converts linear RGB (0-1 range) to sRGB
 * Applies gamma correction
 */
export function linearToSrgb(channel: number): number {
  if (channel <= 0.0031308) {
    return channel * 12.92;
  }
  return 1.055 * Math.pow(channel, 1 / 2.4) - 0.055;
}

/**
 * Converts linear RGB to OKLAB color space
 * Implementation from: https://bottosson.github.io/posts/oklab/
 * @param c - Linear RGB color (values in 0-1 range)
 * @returns OKLAB color
 */
export function linearSrgbToOklab(c: LinearRGB): OKLAB {
  const l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b;
  const m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b;
  const s = 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  return {
    L: 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
  };
}

/**
 * Converts OKLAB to linear RGB color space
 * @param c - OKLAB color
 * @returns Linear RGB color (values in 0-1 range)
 */
export function oklabToLinearSrgb(c: OKLAB): LinearRGB {
  const l_ = c.L + 0.3963377774 * c.a + 0.2158037573 * c.b;
  const m_ = c.L - 0.1055613458 * c.a - 0.0638541728 * c.b;
  const s_ = c.L - 0.0894841775 * c.a - 1.2914855480 * c.b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  return {
    r: +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  };
}

/**
 * Converts hex color to OKLAB color space
 * @param hex - Hex color string (e.g., "#FF5733")
 * @returns OKLAB color
 */
export function hexToOklab(hex: string): OKLAB {
  const [r, g, b] = hexToRGB(hex);

  // Convert from 0-255 to 0-1 range
  const srgb = {
    r: r / 255,
    g: g / 255,
    b: b / 255,
  };

  // Convert to linear RGB
  const linear = {
    r: srgbToLinear(srgb.r),
    g: srgbToLinear(srgb.g),
    b: srgbToLinear(srgb.b),
  };

  // Convert to OKLAB
  return linearSrgbToOklab(linear);
}

/**
 * Linearly interpolates between two OKLAB colors
 * @param color1 - First OKLAB color
 * @param color2 - Second OKLAB color
 * @param factor - Interpolation factor (0 = color1, 1 = color2)
 * @returns Interpolated OKLAB color
 */
export function interpolateColor(
  color1: OKLAB,
  color2: OKLAB,
  factor: number,
): OKLAB {
  return {
    L: color1.L + (color2.L - color1.L) * factor,
    a: color1.a + (color2.a - color1.a) * factor,
    b: color1.b + (color2.b - color1.b) * factor,
  };
}

// ============================================================================
// Vector Utilities
// ============================================================================

/**
 * Calculates the Euclidean distance between two vectors
 * Useful for comparing colors in perceptually uniform color spaces like OKLAB
 *
 * @param vec1 - First vector
 * @param vec2 - Second vector
 * @returns Euclidean distance between the vectors
 * @throws Error if vectors have different lengths
 */
export function vectorDistance(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) {
    throw new Error(`Vector length mismatch: ${vec1.length} vs ${vec2.length}`);
  }

  let sumSquares = 0;
  for (let i = 0; i < vec1.length; i++) {
    const diff = vec1[i] - vec2[i];
    sumSquares += diff * diff;
  }

  return Math.sqrt(sumSquares);
}
