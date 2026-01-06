import type { OKLAB } from './OKLAB';
import {
  linearToSrgb,
  oklabToLinearSrgb,
  rgbToOklab,
  hexToOklab,
} from './OKLAB';
import { rgbToHex } from './Hex';

// ============================================================================
// OKLCh Color Space Utilities
// ============================================================================

/**
 * Represents a color in the OKLCh color space
 * Cylindrical representation of OKLAB - perceptually uniform with intuitive controls
 * Ideal for color manipulation, gradients, and palette generation
 */
export interface OKLCh {
  L: number; // Lightness (0-1 typically, though can exceed for HDR)
  C: number; // Chroma (saturation/colorfulness, typically 0-0.4)
  h: number; // Hue angle (0-360 degrees)
}

/**
 * Converts OKLAB to OKLCh (cylindrical representation)
 * @param oklab - OKLAB color
 * @returns OKLCh color
 */
export function oklabToOklch(oklab: OKLAB): OKLCh {
  const C = Math.sqrt(oklab.a * oklab.a + oklab.b * oklab.b);
  let h = Math.atan2(oklab.b, oklab.a) * (180 / Math.PI);
  if (h < 0) h += 360;

  return { L: oklab.L, C, h };
}

/**
 * Converts OKLCh to OKLAB (Cartesian representation)
 * @param oklch - OKLCh color
 * @returns OKLAB color
 */
export function oklchToOklab(oklch: OKLCh): OKLAB {
  const hRad = oklch.h * (Math.PI / 180);
  return {
    L: oklch.L,
    a: oklch.C * Math.cos(hRad),
    b: oklch.C * Math.sin(hRad),
  };
}

/**
 * Converts RGB (0-255 range) to OKLCh color space
 * @param rgb - RGB array [r, g, b] with values in 0-255 range
 * @returns OKLCh color
 */
export function rgbToOklch(rgb: number[]): OKLCh {
  const oklab = rgbToOklab(rgb);
  return oklabToOklch(oklab);
}

/**
 * Converts OKLCh to RGB (0-255 range)
 * Clamps values to valid sRGB range
 * @param oklch - OKLCh color
 * @returns RGB array [r, g, b] with values in 0-255 range
 */
export function oklchToRgb(oklch: OKLCh): number[] {
  const oklab = oklchToOklab(oklch);
  const linear = oklabToLinearSrgb(oklab);

  return [
    Math.round(Math.max(0, Math.min(255, linearToSrgb(linear.r) * 255))),
    Math.round(Math.max(0, Math.min(255, linearToSrgb(linear.g) * 255))),
    Math.round(Math.max(0, Math.min(255, linearToSrgb(linear.b) * 255))),
  ];
}

/**
 * Converts hex color to OKLCh color space
 * @param hex - Hex color string (e.g., "#FF5733")
 * @returns OKLCh color
 */
export function hexToOklch(hex: string): OKLCh {
  const oklab = hexToOklab(hex);
  return oklabToOklch(oklab);
}

/**
 * Converts OKLCh to hex color
 * @param oklch - OKLCh color
 * @returns Hex color string (e.g., "FF5733")
 */
export function oklchToHex(oklch: OKLCh): string {
  const rgb = oklchToRgb(oklch);
  return rgbToHex(rgb);
}

/**
 * Linearly interpolates between two OKLCh colors
 * Handles hue interpolation properly (shortest path around the color wheel)
 * Produces perceptually uniform gradients
 *
 * @param color1 - First OKLCh color
 * @param color2 - Second OKLCh color
 * @param factor - Interpolation factor (0 = color1, 1 = color2)
 * @returns Interpolated OKLCh color
 */
export function interpolateOklch(
  color1: OKLCh,
  color2: OKLCh,
  factor: number,
): OKLCh {
  // Interpolate L and C linearly
  const L = color1.L + (color2.L - color1.L) * factor;
  const C = color1.C + (color2.C - color1.C) * factor;

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

  return { L, C, h };
}

/**
 * Adjusts the lightness of an OKLCh color
 * @param oklch - OKLCh color
 * @param adjustment - Amount to adjust lightness (-1 to 1)
 * @returns New OKLCh color with adjusted lightness
 */
export function adjustLightness(oklch: OKLCh, adjustment: number): OKLCh {
  return {
    ...oklch,
    L: Math.max(0, Math.min(1, oklch.L + adjustment)),
  };
}

/**
 * Adjusts the chroma (saturation) of an OKLCh color
 * @param oklch - OKLCh color
 * @param adjustment - Amount to adjust chroma (-1 to 1)
 * @returns New OKLCh color with adjusted chroma
 */
export function adjustChroma(oklch: OKLCh, adjustment: number): OKLCh {
  return {
    ...oklch,
    C: Math.max(0, oklch.C + adjustment),
  };
}

/**
 * Adjusts the hue of an OKLCh color
 * @param oklch - OKLCh color
 * @param degrees - Amount to rotate hue (in degrees)
 * @returns New OKLCh color with adjusted hue
 */
export function adjustHue(oklch: OKLCh, degrees: number): OKLCh {
  let h = oklch.h + degrees;
  while (h < 0) h += 360;
  while (h >= 360) h -= 360;

  return {
    ...oklch,
    h,
  };
}

/**
 * Creates a complementary color (opposite on the color wheel)
 * @param oklch - OKLCh color
 * @returns Complementary OKLCh color
 */
export function getComplementary(oklch: OKLCh): OKLCh {
  return adjustHue(oklch, 180);
}

/**
 * Creates a triadic color scheme (120° apart on the color wheel)
 * @param oklch - OKLCh color
 * @returns Array of three OKLCh colors forming a triadic harmony
 */
export function getTriadic(oklch: OKLCh): [OKLCh, OKLCh, OKLCh] {
  return [
    oklch,
    adjustHue(oklch, 120),
    adjustHue(oklch, 240),
  ];
}

/**
 * Creates an analogous color scheme (colors adjacent on the wheel)
 * @param oklch - OKLCh color
 * @param angle - Angle between colors (default 30°)
 * @returns Array of three OKLCh colors forming an analogous harmony
 */
export function getAnalogous(oklch: OKLCh, angle = 30): [OKLCh, OKLCh, OKLCh] {
  return [
    adjustHue(oklch, -angle),
    oklch,
    adjustHue(oklch, angle),
  ];
}
