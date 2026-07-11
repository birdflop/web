import { rgbToHsl, interpolateHsl, hslToRgb, type HSL } from '../Colors';
import {
  BaseGradient,
  BaseTwoStopGradient,
  RGBColorStop,
} from './BaseGradient';

/**
 * HSL-based gradient classes using intuitive color interpolation.
 * HSL (Hue, Saturation, Lightness) is the most user-friendly color space,
 * though not perceptually uniform. Great for UI controls and color pickers.
 */

/**
 * HSL-based gradient that provides intuitive color interpolation.
 * Handles hue interpolation properly (shortest path around the color wheel).
 * Ideal for UI animations and when perceptual uniformity isn't critical.
 */
export class HslGradient extends BaseGradient {
  constructor(colors: RGBColorStop[], numSteps: number) {
    super(colors, numSteps, HslTwoStopGradient);
  }
}

/**
 * Two-stop gradient in HSL color space.
 * Interpolates smoothly between two colors using HSL space.
 * Handles hue interpolation intelligently (shortest path around the color wheel).
 */
class HslTwoStopGradient extends BaseTwoStopGradient<HSL> {
  protected rgbToColorSpace(rgb: number[]): HSL {
    return rgbToHsl(rgb);
  }

  protected interpolate(start: HSL, end: HSL, factor: number): HSL {
    return interpolateHsl(start, end, factor);
  }

  protected colorSpaceToRgb(color: HSL): number[] {
    return hslToRgb(color);
  }
}

/**
 * Animated gradient in HSL color space with offset support.
 * Perfect for creating intuitive animated color effects with natural hue transitions.
 * Great for UI animations, loading indicators, and when ease of use trumps perceptual accuracy.
 */
export class HslAnimatedGradient extends HslGradient {
  constructor(colors: RGBColorStop[], numSteps: number, offset: number) {
    if (numSteps < 2) numSteps = 2;
    if (offset < 0) offset = 0;
    super(colors, numSteps);
    this.step = offset;
  }
}
