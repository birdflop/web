import { rgbToLchab, interpolateLchab, lchabToRgb, type LCHab } from '../Colors';
import { BaseGradient, BaseTwoStopGradient } from './BaseGradient';

/**
 * CIELAB/LCh(ab)-based gradient classes using perceptually uniform color interpolation.
 * CIELAB is the industry standard for perceptually uniform color spaces.
 * LCh(ab) is the cylindrical representation - ideal for gradients with hue changes.
 */

/**
 * LCh(ab)-based gradient that provides perceptually uniform color interpolation.
 * Industry standard for accurate color transitions in print and photography.
 * Handles hue interpolation properly (shortest path around the color wheel).
 */
export class CielabGradient extends BaseGradient {
  constructor(colors: { rgb: number[], pos: number }[], numSteps: number) {
    super(colors, numSteps, CielabTwoStopGradient);
  }
}

/**
 * Two-stop gradient in LCh(ab) color space.
 * Interpolates smoothly between two colors using perceptually uniform CIELAB space.
 * Handles hue interpolation intelligently (shortest path around the color wheel).
 * Industry standard for print, photography, and color-accurate work.
 */
class CielabTwoStopGradient extends BaseTwoStopGradient<LCHab> {
  protected rgbToColorSpace(rgb: number[]): LCHab {
    return rgbToLchab(rgb);
  }

  protected interpolate(start: LCHab, end: LCHab, factor: number): LCHab {
    return interpolateLchab(start, end, factor);
  }

  protected colorSpaceToRgb(color: LCHab): number[] {
    return lchabToRgb(color);
  }
}

/**
 * Animated gradient in LCh(ab) color space with offset support.
 * Perfect for creating perceptually uniform animated color effects.
 * Industry standard quality for professional applications.
 */
export class CielabAnimatedGradient extends CielabGradient {
  constructor(colors: { rgb: number[], pos: number }[], numSteps: number, offset: number) {
    if (numSteps < 2) numSteps = 2;
    if (offset < 0) offset = 0;
    super(colors, numSteps);
    this.step = offset;
  }
}
