import { rgbToOklab, interpolateColor, oklabToLinearSrgb, linearToSrgb, type OKLAB } from '../Colors';

/**
 * OKLAB-based gradient classes using perceptually uniform color interpolation.
 * Provides better color mixing than RGB interpolation.
 */

/**
 * OKLAB-based gradient that provides perceptually uniform color interpolation.
 * Unlike RGB interpolation, OKLAB ensures that color transitions appear smooth
 * and natural to the human eye, avoiding muddy colors in the middle of gradients.
 */
export class OklabGradient {
  colors: { rgb: number[], pos: number }[];
  gradients: OklabTwoStopGradient[];
  steps: number;
  step: number;

  constructor(colors: { rgb: number[], pos: number }[], numSteps: number) {
    this.colors = colors;
    this.gradients = [];
    this.steps = numSteps - 1;
    this.step = 0;

    // Ensure gradient starts at 0%
    if (colors[0].pos !== 0) {
      colors.unshift({ rgb: colors[0].rgb, pos: 0 });
    }
    // Ensure gradient ends at 100%
    if (colors[colors.length - 1].pos !== 100) {
      colors.push({ rgb: colors[colors.length - 1].rgb, pos: 100 });
    }

    for (let i = 0; i < colors.length - 1; i++) {
      let currentColor = colors[i];
      let nextColor = colors[i + 1];

      // Swap if positions are reversed
      if (currentColor.pos > nextColor.pos) {
        const temp = currentColor;
        currentColor = nextColor;
        nextColor = temp;
      }

      const lowerRange = Math.round(currentColor.pos / 100 * this.steps);
      const upperRange = Math.round(nextColor.pos / 100 * this.steps);

      if (upperRange < 1) continue;
      if (lowerRange === upperRange) continue;

      this.gradients.push(
        new OklabTwoStopGradient(
          currentColor.rgb,
          nextColor.rgb,
          lowerRange,
          upperRange,
        ),
      );
    }
  }

  /**
   * Gets the next color in the gradient sequence as an RGB array [r, g, b]
   * Values are in 0-255 range
   */
  next(): number[] {
    if (this.steps < 1) {
      // Single color, just return it
      return this.colors[0].rgb;
    }

    const adjustedStep = Math.round(
      Math.abs(
        ((2 * Math.asin(Math.sin(this.step * (Math.PI / (2 * this.steps))))) / Math.PI) * this.steps,
      ),
    );

    let color: number[];
    if (this.gradients.length < 2) {
      color = this.gradients[0].colorAt(adjustedStep);
    } else {
      const gradient = this.gradients.find(
        g => g.lowerRange <= adjustedStep && g.upperRange >= adjustedStep,
      );
      if (!gradient) {
        return this.colors[0].rgb;
      }
      color = gradient.colorAt(adjustedStep);
    }

    this.step++;
    return color;
  }
}

/**
 * Two-stop gradient in OKLAB color space.
 * Interpolates smoothly between two colors using perceptually uniform OKLAB space.
 */
class OklabTwoStopGradient {
  startColor: OKLAB;
  endColor: OKLAB;
  lowerRange: number;
  upperRange: number;

  constructor(startRgb: number[], endRgb: number[], lowerRange: number, upperRange: number) {
    this.startColor = rgbToOklab(startRgb);
    this.endColor = rgbToOklab(endRgb);
    this.lowerRange = lowerRange;
    this.upperRange = upperRange;
  }

  /**
   * Returns the RGB color at a specific step in the gradient
   * @param step - The current step position
   * @returns RGB array [r, g, b] in 0-255 range
   */
  colorAt(step: number): number[] {
    // Calculate interpolation factor (0 to 1)
    const range = this.upperRange - this.lowerRange;
    const factor = range > 0 ? (step - this.lowerRange) / range : 0;

    // Interpolate in OKLAB space
    const interpolated = interpolateColor(this.startColor, this.endColor, factor);

    // Convert back to RGB
    const linear = oklabToLinearSrgb(interpolated);
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
