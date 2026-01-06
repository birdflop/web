import { rgbToOklab, interpolateColor, oklabToLinearSrgb, linearToSrgb, type OKLAB } from '../Colors';
import { BaseGradient, BaseTwoStopGradient } from './BaseGradient';

/**
 * OKLAB-based gradient classes using perceptually uniform color interpolation.
 * Provides better color mixing than RGB interpolation.
 */

/**
 * OKLAB-based gradient that provides perceptually uniform color interpolation.
 * Unlike RGB interpolation, OKLAB ensures that color transitions appear smooth
 * and natural to the human eye, avoiding muddy colors in the middle of gradients.
 */
export class OklabGradient extends BaseGradient {
  constructor(colors: { rgb: number[], pos: number }[], numSteps: number) {
    super(colors, numSteps, OklabTwoStopGradient);
  }
}

/**
 * Two-stop gradient in OKLAB color space.
 * Interpolates smoothly between two colors using perceptually uniform OKLAB space.
 */
class OklabTwoStopGradient extends BaseTwoStopGradient<OKLAB> {
  protected rgbToColorSpace(rgb: number[]): OKLAB {
    return rgbToOklab(rgb);
  }

  protected interpolate(start: OKLAB, end: OKLAB, factor: number): OKLAB {
    return interpolateColor(start, end, factor);
  }

  protected colorSpaceToRgb(color: OKLAB): number[] {
    const linear = oklabToLinearSrgb(color);
    return [
      Math.round(Math.max(0, Math.min(255, linearToSrgb(linear.r) * 255))),
      Math.round(Math.max(0, Math.min(255, linearToSrgb(linear.g) * 255))),
      Math.round(Math.max(0, Math.min(255, linearToSrgb(linear.b) * 255))),
    ];
  }
}

/**
 * Animated gradient in OKLAB color space with offset support.
 * Perfect for creating smooth, perceptually uniform animated color effects.
 */
export class OklabAnimatedGradient extends OklabGradient {
  constructor(colors: { rgb: number[], pos: number }[], numSteps: number, offset: number) {
    if (numSteps < 2) numSteps = 2;
    if (offset < 0) offset = 0;
    super(colors, numSteps);
    this.step = offset;
  }
}
