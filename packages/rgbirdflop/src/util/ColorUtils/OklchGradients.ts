import { rgbToOklch, interpolateOklch, oklchToRgb, type OKLCh } from '../Colors';
import { BaseGradient, BaseTwoStopGradient, RGBColorStop } from './BaseGradient';

/**
 * OKLCh-based gradient classes using perceptually uniform color interpolation.
 * OKLCh is a cylindrical representation of OKLAB with excellent perceptual uniformity.
 * Provides the best balance of accurate color mixing and intuitive hue control.
 * Ideal for smooth gradients, UI animations, and color palette generation.
 */

/**
 * OKLCh-based gradient that provides perceptually uniform color interpolation.
 * Unlike RGB interpolation, OKLCh ensures smooth color transitions and handles
 * hue interpolation properly (shortest path around the color wheel).
 * Combines OKLAB's superior perceptual uniformity with intuitive cylindrical controls.
 */
export class OklchGradient extends BaseGradient {
  constructor(colors: RGBColorStop[], numSteps: number) {
    super(colors, numSteps, OklchTwoStopGradient);
  }
}

/**
 * Two-stop gradient in OKLCh color space.
 * Interpolates smoothly between two colors using perceptually uniform OKLCh space.
 * Handles hue interpolation intelligently (shortest path around the color wheel).
 * Provides superior color accuracy compared to RGB and better hue control than OKLAB.
 */
class OklchTwoStopGradient extends BaseTwoStopGradient<OKLCh> {
  protected rgbToColorSpace(rgb: number[]): OKLCh {
    return rgbToOklch(rgb);
  }

  protected interpolate(start: OKLCh, end: OKLCh, factor: number): OKLCh {
    return interpolateOklch(start, end, factor);
  }

  protected colorSpaceToRgb(color: OKLCh): number[] {
    return oklchToRgb(color);
  }
}

/**
 * Animated gradient in OKLCh color space with offset support.
 * Perfect for creating smooth, perceptually uniform animated color effects
 * with natural hue transitions and superior color accuracy.
 * Ideal for UI animations, loading indicators, and dynamic color effects.
 */
export class OklchAnimatedGradient extends OklchGradient {
  constructor(colors: RGBColorStop[], numSteps: number, offset: number) {
    if (numSteps < 2) numSteps = 2;
    if (offset < 0) offset = 0;
    super(colors, numSteps);
    this.step = offset;
  }
}
