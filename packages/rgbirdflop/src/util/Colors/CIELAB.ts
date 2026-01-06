import type { XYZ } from './LuvLCh';
import { srgbToLinear, linearToSrgb } from './OKLAB';
import { linearRgbToXyz, xyzToLinearRgb } from './LuvLCh';
import { hexToRGB, rgbToHex } from './Hex';

// ============================================================================
// CIELAB Color Space Utilities
// ============================================================================

/**
 * Represents a color in the CIELAB color space
 * CIELAB (L*a*b*) is the most established perceptually uniform color space
 * Industry standard for color science, print, and photography
 */
export interface CIELAB {
  L: number; // Lightness (0-100)
  a: number; // Green-red axis
  b: number; // Blue-yellow axis
}

/**
 * Represents a color in the LCh(ab) color space
 * Cylindrical representation of CIELAB
 * More intuitive than CIELAB for color manipulation
 */
export interface LCHab {
  L: number; // Lightness (0-100)
  C: number; // Chroma (saturation)
  h: number; // Hue angle (0-360 degrees)
}

/**
 * D65 standard illuminant white point (used for sRGB)
 */
const D65_WHITE_POINT = {
  X: 0.95047,
  Y: 1.00000,
  Z: 1.08883,
};

/**
 * Converts CIE XYZ to CIELAB color space
 * @param xyz - XYZ color
 * @param whitePoint - Reference white point (defaults to D65)
 */
export function xyzToLab(xyz: XYZ, whitePoint = D65_WHITE_POINT): CIELAB {
  const epsilon = 216 / 24389; // 6^3 / 29^3
  const kappa = 24389 / 27;    // 29^3 / 3^3

  const xr = xyz.X / whitePoint.X;
  const yr = xyz.Y / whitePoint.Y;
  const zr = xyz.Z / whitePoint.Z;

  const fx = xr > epsilon ? Math.cbrt(xr) : (kappa * xr + 16) / 116;
  const fy = yr > epsilon ? Math.cbrt(yr) : (kappa * yr + 16) / 116;
  const fz = zr > epsilon ? Math.cbrt(zr) : (kappa * zr + 16) / 116;

  const L = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const b = 200 * (fy - fz);

  return { L, a, b };
}

/**
 * Converts CIELAB to CIE XYZ color space
 * @param lab - CIELAB color
 * @param whitePoint - Reference white point (defaults to D65)
 */
export function labToXyz(lab: CIELAB, whitePoint = D65_WHITE_POINT): XYZ {
  const epsilon = 216 / 24389;
  const kappa = 24389 / 27;

  const fy = (lab.L + 16) / 116;
  const fx = lab.a / 500 + fy;
  const fz = fy - lab.b / 200;

  const xr = fx * fx * fx > epsilon ? fx * fx * fx : (116 * fx - 16) / kappa;
  const yr = lab.L > kappa * epsilon ? fy * fy * fy : lab.L / kappa;
  const zr = fz * fz * fz > epsilon ? fz * fz * fz : (116 * fz - 16) / kappa;

  return {
    X: xr * whitePoint.X,
    Y: yr * whitePoint.Y,
    Z: zr * whitePoint.Z,
  };
}

/**
 * Converts CIELAB to LCh(ab) (cylindrical representation)
 */
export function labToLchab(lab: CIELAB): LCHab {
  const C = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
  let h = Math.atan2(lab.b, lab.a) * (180 / Math.PI);
  if (h < 0) h += 360;

  return { L: lab.L, C, h };
}

/**
 * Converts LCh(ab) to CIELAB (Cartesian representation)
 */
export function lchabToLab(lch: LCHab): CIELAB {
  const hRad = lch.h * (Math.PI / 180);
  return {
    L: lch.L,
    a: lch.C * Math.cos(hRad),
    b: lch.C * Math.sin(hRad),
  };
}

/**
 * Converts RGB (0-255 range) to CIELAB color space
 */
export function rgbToLab(rgb: number[]): CIELAB {
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
  return xyzToLab(xyz);
}

/**
 * Converts CIELAB to RGB (0-255 range)
 */
export function labToRgb(lab: CIELAB): number[] {
  const xyz = labToXyz(lab);
  const linear = xyzToLinearRgb(xyz);

  return [
    Math.round(Math.max(0, Math.min(255, linearToSrgb(linear.r) * 255))),
    Math.round(Math.max(0, Math.min(255, linearToSrgb(linear.g) * 255))),
    Math.round(Math.max(0, Math.min(255, linearToSrgb(linear.b) * 255))),
  ];
}

/**
 * Converts hex color to CIELAB color space
 */
export function hexToLab(hex: string): CIELAB {
  const rgb = hexToRGB(hex);
  return rgbToLab(rgb);
}

/**
 * Converts CIELAB to hex color
 */
export function labToHex(lab: CIELAB): string {
  const rgb = labToRgb(lab);
  return rgbToHex(rgb);
}

/**
 * Linearly interpolates between two CIELAB colors
 */
export function interpolateLab(
  color1: CIELAB,
  color2: CIELAB,
  factor: number,
): CIELAB {
  return {
    L: color1.L + (color2.L - color1.L) * factor,
    a: color1.a + (color2.a - color1.a) * factor,
    b: color1.b + (color2.b - color1.b) * factor,
  };
}

// ============================================================================
// LCh(ab) Color Space Utilities
// ============================================================================

/**
 * Converts RGB (0-255 range) to LCh(ab) color space
 */
export function rgbToLchab(rgb: number[]): LCHab {
  const lab = rgbToLab(rgb);
  return labToLchab(lab);
}

/**
 * Converts LCh(ab) to RGB (0-255 range)
 */
export function lchabToRgb(lch: LCHab): number[] {
  const lab = lchabToLab(lch);
  return labToRgb(lab);
}

/**
 * Converts hex color to LCh(ab) color space
 */
export function hexToLchab(hex: string): LCHab {
  const lab = hexToLab(hex);
  return labToLchab(lab);
}

/**
 * Converts LCh(ab) to hex color
 */
export function lchabToHex(lch: LCHab): string {
  const rgb = lchabToRgb(lch);
  return rgbToHex(rgb);
}

/**
 * Linearly interpolates between two LCh(ab) colors
 * Handles hue interpolation properly (shortest path around the color wheel)
 */
export function interpolateLchab(
  color1: LCHab,
  color2: LCHab,
  factor: number,
): LCHab {
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

// ============================================================================
// Delta E Color Difference Utilities
// ============================================================================

/**
 * Calculates Delta E (CIE76) - Euclidean distance in CIELAB space
 * Industry standard for measuring color difference
 * Values: 0 = identical, 1 = JND (just noticeable difference), >2 = noticeable
 * @param lab1 - First CIELAB color
 * @param lab2 - Second CIELAB color
 * @returns Delta E value
 */
export function deltaE76(lab1: CIELAB, lab2: CIELAB): number {
  const dL = lab1.L - lab2.L;
  const da = lab1.a - lab2.a;
  const db = lab1.b - lab2.b;

  return Math.sqrt(dL * dL + da * da + db * db);
}

/**
 * Calculates Delta E (CIE94) - Improved perceptual uniformity
 * Better matches human perception than CIE76
 * @param lab1 - First CIELAB color
 * @param lab2 - Second CIELAB color
 * @returns Delta E value
 */
export function deltaE94(lab1: CIELAB, lab2: CIELAB): number {
  const dL = lab1.L - lab2.L;
  const C1 = Math.sqrt(lab1.a * lab1.a + lab1.b * lab1.b);
  const C2 = Math.sqrt(lab2.a * lab2.a + lab2.b * lab2.b);
  const dC = C1 - C2;
  const da = lab1.a - lab2.a;
  const db = lab1.b - lab2.b;
  const dH = Math.sqrt(Math.max(0, da * da + db * db - dC * dC));

  const kL = 1;
  const kC = 1;
  const kH = 1;
  const k1 = 0.045;
  const k2 = 0.015;

  const sL = 1;
  const sC = 1 + k1 * C1;
  const sH = 1 + k2 * C1;

  const dLNorm = dL / (kL * sL);
  const dCNorm = dC / (kC * sC);
  const dHNorm = dH / (kH * sH);

  return Math.sqrt(dLNorm * dLNorm + dCNorm * dCNorm + dHNorm * dHNorm);
}

/**
 * Calculates Delta E (CIEDE2000) - Most accurate perceptual color difference
 * Current industry standard, complex but most accurate
 * @param lab1 - First CIELAB color
 * @param lab2 - Second CIELAB color
 * @returns Delta E value
 */
export function deltaE2000(lab1: CIELAB, lab2: CIELAB): number {
  const L1 = lab1.L;
  const a1 = lab1.a;
  const b1 = lab1.b;
  const L2 = lab2.L;
  const a2 = lab2.a;
  const b2 = lab2.b;

  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const Cab = (C1 + C2) / 2;

  const G = 0.5 * (1 - Math.sqrt(Math.pow(Cab, 7) / (Math.pow(Cab, 7) + Math.pow(25, 7))));

  const a1p = a1 * (1 + G);
  const a2p = a2 * (1 + G);

  const C1p = Math.sqrt(a1p * a1p + b1 * b1);
  const C2p = Math.sqrt(a2p * a2p + b2 * b2);

  const h1p = a1p === 0 && b1 === 0 ? 0 : Math.atan2(b1, a1p) * 180 / Math.PI;
  const h2p = a2p === 0 && b2 === 0 ? 0 : Math.atan2(b2, a2p) * 180 / Math.PI;

  const h1pAdj = h1p >= 0 ? h1p : h1p + 360;
  const h2pAdj = h2p >= 0 ? h2p : h2p + 360;

  const dLp = L2 - L1;
  const dCp = C2p - C1p;

  let dhp: number;
  if (C1p * C2p === 0) {
    dhp = 0;
  } else if (Math.abs(h2pAdj - h1pAdj) <= 180) {
    dhp = h2pAdj - h1pAdj;
  } else if (h2pAdj - h1pAdj > 180) {
    dhp = h2pAdj - h1pAdj - 360;
  } else {
    dhp = h2pAdj - h1pAdj + 360;
  }

  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp * Math.PI / 180) / 2);

  const Lbarp = (L1 + L2) / 2;
  const Cbarp = (C1p + C2p) / 2;

  let Hbarp: number;
  if (C1p * C2p === 0) {
    Hbarp = h1pAdj + h2pAdj;
  } else if (Math.abs(h1pAdj - h2pAdj) <= 180) {
    Hbarp = (h1pAdj + h2pAdj) / 2;
  } else if (h1pAdj + h2pAdj < 360) {
    Hbarp = (h1pAdj + h2pAdj + 360) / 2;
  } else {
    Hbarp = (h1pAdj + h2pAdj - 360) / 2;
  }

  const T = 1 - 0.17 * Math.cos((Hbarp - 30) * Math.PI / 180) +
    0.24 * Math.cos(2 * Hbarp * Math.PI / 180) +
    0.32 * Math.cos((3 * Hbarp + 6) * Math.PI / 180) -
    0.20 * Math.cos((4 * Hbarp - 63) * Math.PI / 180);

  const dTheta = 30 * Math.exp(-Math.pow((Hbarp - 275) / 25, 2));

  const Rc = 2 * Math.sqrt(Math.pow(Cbarp, 7) / (Math.pow(Cbarp, 7) + Math.pow(25, 7)));

  const Sl = 1 + (0.015 * Math.pow(Lbarp - 50, 2)) / Math.sqrt(20 + Math.pow(Lbarp - 50, 2));
  const Sc = 1 + 0.045 * Cbarp;
  const Sh = 1 + 0.015 * Cbarp * T;

  const Rt = -Math.sin(2 * dTheta * Math.PI / 180) * Rc;

  const kL = 1;
  const kC = 1;
  const kH = 1;

  const dE = Math.sqrt(
    Math.pow(dLp / (kL * Sl), 2) +
    Math.pow(dCp / (kC * Sc), 2) +
    Math.pow(dHp / (kH * Sh), 2) +
    Rt * (dCp / (kC * Sc)) * (dHp / (kH * Sh)),
  );

  return dE;
}
