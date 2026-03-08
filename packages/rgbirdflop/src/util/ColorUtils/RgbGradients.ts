import { BaseTwoStopGradient, BaseGradient, RGBColorStop } from './BaseGradient';

/**
 * RGB-based gradient classes using linear RGB interpolation.
 * While not perceptually uniform, RGB interpolation is straightforward
 * and computationally efficient. Suitable for simple applications where
 * performance is prioritized over color accuracy.
 */

/**
 * Gradient that interpolates colors in RGB color space.
 * Uses linear interpolation between color stops.
 */
export class RgbGradient extends BaseGradient {
  constructor(colors: RGBColorStop[], numSteps: number) {
    super(colors, numSteps, RgbTwoStopGradient);
  }
}

/**
 * Two-stop gradient in RGB color space.
 * Interpolates linearly between two RGB colors.
 */
class RgbTwoStopGradient extends BaseTwoStopGradient<number[]> {
  protected rgbToColorSpace(rgb: number[]): number[] {
    return rgb;
  }

  protected interpolate(start: number[], end: number[], factor: number): number[] {
    return [
      start[0] + (end[0] - start[0]) * factor,
      start[1] + (end[1] - start[1]) * factor,
      start[2] + (end[2] - start[2]) * factor,
    ];
  }

  protected colorSpaceToRgb(color: number[]): number[] {
    return [
      Math.round(color[0]),
      Math.round(color[1]),
      Math.round(color[2]),
    ];
  }
}

/**
 * Animated gradient in RGB color space with offset support.
 */
export class RgbAnimatedGradient extends RgbGradient {
  constructor(colors: RGBColorStop[], numSteps: number, offset: number) {
    if (numSteps < 2) numSteps = 2;
    if (offset < 0) offset = 0;
    super(colors, numSteps);
    this.step = offset;
  }
}
