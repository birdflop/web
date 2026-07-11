import type { LinearRGB } from './OKLAB';
import { srgbToLinear, linearToSrgb } from './OKLAB';

// ============================================================================
// LuvLCh (CIELCh(uv)) Color Space Utilities
// ============================================================================

/**
 * Represents a color in the XYZ color space
 * CIE 1931 XYZ color space - device-independent representation
 */
export interface XYZ {
  X: number;
  Y: number;
  Z: number;
}

/**
 * Represents a color in the CIELUV color space
 * Perceptually uniform color space
 */
export interface CIELUV {
  L: number; // Lightness (0-100)
  u: number; // Green-red axis
  v: number; // Blue-yellow axis
}

/**
 * Represents a color in the LuvLCh (CIELCh(uv)) color space
 * Cylindrical representation of CIELUV
 */
export interface LuvLCh {
  L: number; // Lightness (0-100)
  C: number; // Chroma (saturation)
  h: number; // Hue angle (0-360 degrees)
}

/**
 * D65 standard illuminant white point (used for sRGB)
 */
const D65_WHITE_POINT = {
  X: 0.95047,
  Y: 1.0,
  Z: 1.08883,
};

/**
 * Converts linear RGB to CIE XYZ color space
 * Uses sRGB → XYZ transformation matrix with D65 illuminant
 */
export function linearRgbToXyz(linear: LinearRGB): XYZ {
  const r = linear.r;
  const g = linear.g;
  const b = linear.b;

  return {
    X: r * 0.4124564 + g * 0.3575761 + b * 0.1804375,
    Y: r * 0.2126729 + g * 0.7151522 + b * 0.072175,
    Z: r * 0.0193339 + g * 0.119192 + b * 0.9503041,
  };
}

/**
 * Converts CIE XYZ to linear RGB
 * Uses XYZ → sRGB transformation matrix with D65 illuminant
 */
export function xyzToLinearRgb(xyz: XYZ): LinearRGB {
  const X = xyz.X;
  const Y = xyz.Y;
  const Z = xyz.Z;

  return {
    r: X * 3.2404542 + Y * -1.5371385 + Z * -0.4985314,
    g: X * -0.969266 + Y * 1.8760108 + Z * 0.041556,
    b: X * 0.0556434 + Y * -0.2040259 + Z * 1.0572252,
  };
}

/**
 * Converts CIE XYZ to CIELUV color space
 * @param xyz - XYZ color
 * @param whitePoint - Reference white point (defaults to D65)
 */
export function xyzToLuv(xyz: XYZ, whitePoint = D65_WHITE_POINT): CIELUV {
  const epsilon = 216 / 24389;
  const kappa = 24389 / 27;

  const yr = xyz.Y / whitePoint.Y;
  const L = yr > epsilon ? 116 * Math.cbrt(yr) - 16 : kappa * yr;

  const denom = xyz.X + 15 * xyz.Y + 3 * xyz.Z;
  const denomR = whitePoint.X + 15 * whitePoint.Y + 3 * whitePoint.Z;

  if (denom === 0) {
    return { L, u: 0, v: 0 };
  }

  const u_prime = (4 * xyz.X) / denom;
  const v_prime = (9 * xyz.Y) / denom;
  const ur_prime = (4 * whitePoint.X) / denomR;
  const vr_prime = (9 * whitePoint.Y) / denomR;

  const u = 13 * L * (u_prime - ur_prime);
  const v = 13 * L * (v_prime - vr_prime);

  return { L, u, v };
}

/**
 * Converts CIELUV to CIE XYZ color space
 * @param luv - CIELUV color
 * @param whitePoint - Reference white point (defaults to D65)
 */
export function luvToXyz(luv: CIELUV, whitePoint = D65_WHITE_POINT): XYZ {
  const epsilon = 216 / 24389;
  const kappa = 24389 / 27;

  if (luv.L === 0) {
    return { X: 0, Y: 0, Z: 0 };
  }

  const denomR = whitePoint.X + 15 * whitePoint.Y + 3 * whitePoint.Z;
  const ur_prime = (4 * whitePoint.X) / denomR;
  const vr_prime = (9 * whitePoint.Y) / denomR;

  const u_prime = luv.u / (13 * luv.L) + ur_prime;
  const v_prime = luv.v / (13 * luv.L) + vr_prime;

  const Y =
    luv.L > kappa * epsilon
      ? Math.pow((luv.L + 16) / 116, 3) * whitePoint.Y
      : (luv.L / kappa) * whitePoint.Y;

  const X = (Y * 9 * u_prime) / (4 * v_prime);
  const Z = (Y * (12 - 3 * u_prime - 20 * v_prime)) / (4 * v_prime);

  return { X, Y, Z };
}

/**
 * Converts CIELUV to LuvLCh (cylindrical representation)
 */
export function luvToLch(luv: CIELUV): LuvLCh {
  const C = Math.sqrt(luv.u * luv.u + luv.v * luv.v);
  let h = Math.atan2(luv.v, luv.u) * (180 / Math.PI);
  if (h < 0) h += 360;

  return { L: luv.L, C, h };
}

/**
 * Converts LuvLCh to CIELUV (Cartesian representation)
 */
export function lchToLuv(lch: LuvLCh): CIELUV {
  const hRad = lch.h * (Math.PI / 180);
  return {
    L: lch.L,
    u: lch.C * Math.cos(hRad),
    v: lch.C * Math.sin(hRad),
  };
}

/**
 * Converts RGB (0-255 range) to LuvLCh color space
 */
export function rgbToLch(rgb: number[]): LuvLCh {
  const srgb = {
    r: rgb[0] / 255,
    g: rgb[1] / 255,
    b: rgb[2] / 255,
  };

  const linear = {
    r: srgbToLinear(srgb.r),
    g: srgbToLinear(srgb.g),
    b: srgbToLinear(srgb.b),
  };

  const xyz = linearRgbToXyz(linear);
  const luv = xyzToLuv(xyz);
  return luvToLch(luv);
}

/**
 * Converts LuvLCh to RGB (0-255 range)
 */
export function lchToRgb(lch: LuvLCh): number[] {
  const luv = lchToLuv(lch);
  const xyz = luvToXyz(luv);
  const linear = xyzToLinearRgb(xyz);

  return [
    Math.round(Math.max(0, Math.min(255, linearToSrgb(linear.r) * 255))),
    Math.round(Math.max(0, Math.min(255, linearToSrgb(linear.g) * 255))),
    Math.round(Math.max(0, Math.min(255, linearToSrgb(linear.b) * 255))),
  ];
}

/**
 * Linearly interpolates between two LuvLCh colors
 * Handles hue interpolation properly (shortest path around the color wheel)
 */
export function interpolateLch(
  color1: LuvLCh,
  color2: LuvLCh,
  factor: number
): LuvLCh {
  // Interpolate L and C linearly
  const L = color1.L + (color2.L - color1.L) * factor;
  const C = color1.C + (color2.C - color1.C) * factor;

  // Interpolate hue using shortest path
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
