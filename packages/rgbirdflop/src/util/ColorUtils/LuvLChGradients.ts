import { rgbToLch, interpolateLch, lchToRgb, type LuvLCh } from '../Colors';
import { BaseGradient, BaseTwoStopGradient, RGBColorStop } from './BaseGradient';

/**
 * LuvLCh (CIELCh(uv))-based gradient classes using perceptually uniform color interpolation.
 * LuvLCh is a cylindrical representation of CIELUV that handles hue rotation naturally.
 * Provides excellent results for gradients involving hue shifts.
 */

/**
 * LuvLCh-based gradient that provides perceptually uniform color interpolation.
 * Unlike RGB interpolation, LuvLCh ensures smooth color transitions and handles
 * hue interpolation properly (shortest path around the color wheel).
 * Ideal for gradients with significant hue changes.
 */
export class LuvLChGradient extends BaseGradient {
  constructor(colors: RGBColorStop[], numSteps: number) {
    super(colors, numSteps, LuvLChTwoStopGradient);
  }
}

/**
 * Two-stop gradient in LuvLCh color space.
 * Interpolates smoothly between two colors using perceptually uniform LuvLCh space.
 * Handles hue interpolation intelligently (shortest path around the color wheel).
 */
class LuvLChTwoStopGradient extends BaseTwoStopGradient<LuvLCh> {
  protected rgbToColorSpace(rgb: number[]): LuvLCh {
    return rgbToLch(rgb);
  }

  protected interpolate(start: LuvLCh, end: LuvLCh, factor: number): LuvLCh {
    return interpolateLch(start, end, factor);
  }

  protected colorSpaceToRgb(color: LuvLCh): number[] {
    return lchToRgb(color);
  }
}

/**
 * Animated gradient in LuvLCh color space with offset support.
 * Perfect for creating smooth, perceptually uniform animated color effects
 * with natural hue transitions.
 */
export class LuvLChAnimatedGradient extends LuvLChGradient {
  constructor(colors: RGBColorStop[], numSteps: number, offset: number) {
    if (numSteps < 2) numSteps = 2;
    if (offset < 0) offset = 0;
    super(colors, numSteps);
    this.step = offset;
  }
}
