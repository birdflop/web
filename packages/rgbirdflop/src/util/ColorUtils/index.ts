import { RgbGradient, RgbAnimatedGradient } from './RgbGradients';
import { HslGradient, HslAnimatedGradient } from './HslGradients';
import { OklabGradient, OklabAnimatedGradient } from './OklabGradients';
import { OklchGradient, OklchAnimatedGradient } from './OklchGradients';
import { CielabGradient, CielabAnimatedGradient } from './CielabGradients';
import { LuvLChAnimatedGradient, LuvLChGradient } from './LuvLChGradients';

/**
 * Available gradient types as a const array.
 * This is the single source of truth for gradient type values.
 */
export const GRADIENT_TYPES = ['rgb', 'hsl', 'oklab', 'oklch', 'cielab', 'luvLch'] as const;

/**
 * Union type of all available gradient types.
 * Automatically derived from GRADIENT_TYPES array.
 */
export type GradientType = typeof GRADIENT_TYPES[number];

/**
 * Unified gradient interface that can switch between RGB and OKLAB interpolation.
 * Provides a consistent API regardless of the underlying color space.
 */
export class ColorGradient {
  private gradient: RgbGradient | HslGradient | OklabGradient | OklchGradient | CielabGradient | LuvLChGradient;
  private type: GradientType;

  /**
   * Creates a new gradient with the specified interpolation type
   * @param colors - Array of color stops with RGB values and positions
   * @param numSteps - Number of steps in the gradient
   * @param type - Interpolation type: 'rgb' for linear RGB, 'hsl' for intuitive, 'oklab'/'oklch' for perceptually uniform (default: 'rgb')
   */
  constructor(
    colors: { rgb: number[], pos: number }[],
    numSteps: number,
    type: GradientType = 'rgb',
  ) {
    this.type = type;

    switch (type) {
    case 'hsl':
      this.gradient = new HslGradient(colors, numSteps);
      break;
    case 'oklab':
      this.gradient = new OklabGradient(colors, numSteps);
      break;
    case 'oklch':
      this.gradient = new OklchGradient(colors, numSteps);
      break;
    case 'cielab':
      this.gradient = new CielabGradient(colors, numSteps);
      break;
    case 'luvLch':
      this.gradient = new LuvLChGradient(colors, numSteps);
      break;
    case 'rgb':
    default:
      this.gradient = new RgbGradient(colors, numSteps);
      break;
    }
  }

  /**
   * Gets the next color in the gradient sequence
   * @returns RGB array [r, g, b] with values in 0-255 range
   */
  next(): number[] {
    return this.gradient.next();
  }

  /**
   * Gets the current gradient type
   */
  getType(): GradientType {
    return this.type;
  }
}

/**
 * Unified animated gradient interface that can switch between RGB and OKLAB interpolation.
 * Includes offset support for animation effects.
 */
export class ColorAnimatedGradient {
  private gradient: RgbAnimatedGradient | HslAnimatedGradient | OklabAnimatedGradient | OklchAnimatedGradient | CielabAnimatedGradient | LuvLChAnimatedGradient;
  private type: GradientType;

  /**
   * Creates a new animated gradient with the specified interpolation type
   * @param colors - Array of color stops with RGB values and positions
   * @param numSteps - Number of steps in the gradient
   * @param offset - Starting offset for animation
   * @param type - Interpolation type: 'rgb' for linear RGB, 'hsl' for intuitive, 'oklab'/'oklch' for perceptually uniform (default: 'rgb')
   */
  constructor(
    colors: { rgb: number[], pos: number }[],
    numSteps: number,
    offset: number,
    type: GradientType = 'rgb',
  ) {
    this.type = type;

    switch (type) {
    case 'hsl':
      this.gradient = new HslAnimatedGradient(colors, numSteps, offset);
      break;
    case 'oklab':
      this.gradient = new OklabAnimatedGradient(colors, numSteps, offset);
      break;
    case 'oklch':
      this.gradient = new OklchAnimatedGradient(colors, numSteps, offset);
      break;
    case 'cielab':
      this.gradient = new CielabAnimatedGradient(colors, numSteps, offset);
      break;
    case 'luvLch':
      this.gradient = new LuvLChAnimatedGradient(colors, numSteps, offset);
      break;
    case 'rgb':
    default:
      this.gradient = new RgbAnimatedGradient(colors, numSteps, offset);
      break;
    }
  }

  /**
   * Gets the next color in the gradient sequence
   * @returns RGB array [r, g, b] with values in 0-255 range
   */
  next(): number[] {
    return this.gradient.next();
  }

  /**
   * Gets the current gradient type
   */
  getType(): GradientType {
    return this.type;
  }
}

// Re-export individual gradient classes for direct use
export { RgbGradient, RgbAnimatedGradient } from './RgbGradients';
export { HslGradient, HslAnimatedGradient } from './HslGradients';
export { OklabGradient, OklabAnimatedGradient } from './OklabGradients';
export { OklchGradient, OklchAnimatedGradient } from './OklchGradients';
export { CielabGradient, CielabAnimatedGradient } from './CielabGradients';
export { LuvLChGradient, LuvLChAnimatedGradient } from './LuvLChGradients';
