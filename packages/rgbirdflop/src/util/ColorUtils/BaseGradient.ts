/**
 * Base gradient class that provides common functionality for all gradient types.
 * Handles color stop normalization, gradient segment creation, and step sequencing.
 */

/**
 * Interface for two-stop gradient segments that interpolate between two colors.
 * Each gradient type (RGB, HSL, OKLAB, etc.) implements this interface.
 */
export interface TwoStopGradient {
  lowerRange: number;
  upperRange: number;
  colorAt(step: number): number[];
}

/**
 * Represents a color stop in a gradient.
 * `@property` rgb - RGB or RGBA values in 0-255 range
 * `@property` pos - Position in gradient (0-100)
 */
export type RGBColorStop = {
  rgb: [number, number, number] | [number, number, number, number];
  pos: number;
};

/**
 * Abstract base class for two-stop gradients that handles the common interpolation logic.
 * Subclasses only need to implement color space conversion and interpolation functions.
 */
export abstract class BaseTwoStopGradient<T> implements TwoStopGradient {
  startColor: T;
  endColor: T;
  startAlpha: number;
  endAlpha: number;
  lowerRange: number;
  upperRange: number;

  constructor(
    startRgb: number[],
    endRgb: number[],
    startAlpha: number,
    endAlpha: number,
    lowerRange: number,
    upperRange: number
  ) {
    this.startColor = this.rgbToColorSpace(startRgb);
    this.endColor = this.rgbToColorSpace(endRgb);
    this.startAlpha = startAlpha;
    this.endAlpha = endAlpha;
    this.lowerRange = lowerRange;
    this.upperRange = upperRange;
  }

  /**
   * Convert RGB to the specific color space
   */
  protected abstract rgbToColorSpace(rgb: number[]): T;

  /**
   * Interpolate between two colors in the specific color space
   */
  protected abstract interpolate(start: T, end: T, factor: number): T;

  /**
   * Convert from the specific color space back to RGB
   */
  protected abstract colorSpaceToRgb(color: T): number[];

  /**
   * Returns the RGB color at a specific step in the gradient
   * @param step - The current step position
   * @returns RGB array [r, g, b] in 0-255 range
   */
  colorAt(step: number): number[] {
    // Calculate interpolation factor (0 to 1)
    const range = this.upperRange - this.lowerRange;
    const factor = range > 0 ? (step - this.lowerRange) / range : 0;

    // Interpolate in the specific color space
    const interpolated = this.interpolate(
      this.startColor,
      this.endColor,
      factor
    );

    const interpolatedAlpha =
      this.startAlpha + (this.endAlpha - this.startAlpha) * factor;

    // Convert back to RGB
    return [
      ...this.colorSpaceToRgb(interpolated),
      Math.round(interpolatedAlpha * 255),
    ];
  }
}

/**
 * Type for TwoStopGradient constructors
 */
type TwoStopGradientConstructor = new (
  startRgb: number[],
  endRgb: number[],
  startAlpha: number,
  endAlpha: number,
  lowerRange: number,
  upperRange: number
) => TwoStopGradient;

/**
 * Base class for all gradient types.
 * Implements the common gradient logic. Subclasses only need to pass their
 * specific two-stop gradient class to the constructor.
 */
export class BaseGradient {
  protected colors: RGBColorStop[];
  protected gradients: TwoStopGradient[];
  protected steps: number;
  protected step: number;

  constructor(
    colors: RGBColorStop[],
    numSteps: number,
    private TwoStopGradientClass: TwoStopGradientConstructor
  ) {
    this.colors = colors;
    this.gradients = [];
    this.steps = numSteps - 1;
    this.step = 0;

    // If there are no colors, do nothing
    if (!colors.length) return;

    // Ensure gradient starts at 0%
    if (colors[0].pos !== 0) {
      colors.unshift({ ...colors[0], pos: 0 });
    }
    // Ensure gradient ends at 100%
    if (colors[colors.length - 1].pos !== 100) {
      colors.push({ ...colors[colors.length - 1], pos: 100 });
    }

    // Create gradient segments between each pair of color stops
    for (let i = 0; i < colors.length - 1; i++) {
      let currentColor = colors[i];
      let nextColor = colors[i + 1];

      // Swap if positions are reversed
      if (currentColor.pos > nextColor.pos) {
        const temp = currentColor;
        currentColor = nextColor;
        nextColor = temp;
      }

      const lowerRange = Math.round((currentColor.pos / 100) * this.steps);
      const upperRange = Math.round((nextColor.pos / 100) * this.steps);

      if (upperRange < 1) continue;
      if (lowerRange === upperRange) continue;

      this.gradients.push(
        new this.TwoStopGradientClass(
          currentColor.rgb.slice(0, 3),
          nextColor.rgb.slice(0, 3),
          currentColor.rgb[3] !== undefined ? currentColor.rgb[3] / 255 : 1,
          nextColor.rgb[3] !== undefined ? nextColor.rgb[3] / 255 : 1,
          lowerRange,
          upperRange
        )
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
      return this.colors[0]?.rgb;
    }

    // Apply easing function for smooth transitions
    const adjustedStep = Math.round(
      Math.abs(
        ((2 * Math.asin(Math.sin(this.step * (Math.PI / (2 * this.steps))))) /
          Math.PI) *
          this.steps
      )
    );

    let color: number[];
    if (this.gradients.length < 2) {
      color = this.gradients[0]?.colorAt(adjustedStep);
    } else {
      const gradient = this.gradients.find(
        (g) => g.lowerRange <= adjustedStep && g.upperRange >= adjustedStep
      );
      if (!gradient) {
        return this.colors[0]?.rgb;
      }
      color = gradient.colorAt(adjustedStep);
    }

    this.step++;
    return color;
  }
}
