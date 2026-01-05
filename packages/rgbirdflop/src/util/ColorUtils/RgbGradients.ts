/**
 * RGB-based gradient classes using linear RGB interpolation.
 * Typescript implementation from RoseGarden HexUtils.
 * https://github.com/Rosewood-Development/RoseGarden/blob/master/src/main/java/dev/rosewood/rosegarden/utils/HexUtils.java#L358
 */

/**
 * Gradient that interpolates colors in RGB color space.
 * Uses linear interpolation between color stops.
 */
export class RgbGradient {
  colors: { rgb: number[], pos: number }[];
  gradients: RgbTwoStopGradient[];
  steps: number;
  step: number;

  constructor(colors: { rgb: number[], pos: number }[], numSteps: number) {
    this.colors = colors;
    this.gradients = [];
    this.steps = numSteps - 1;
    this.step = 0;
    if (colors[0].pos !== 0) colors.unshift({ rgb: colors[0].rgb, pos: 0 });
    if (colors[colors.length - 1].pos !== 100) colors.push({ rgb: colors[colors.length - 1].rgb, pos: 100 });

    for (let i = 0; i < colors.length - 1; i++) {
      let currentColor = colors[i];
      let nextColor = colors[i + 1];
      if (currentColor.pos > nextColor.pos) {
        const newColor = currentColor;
        currentColor = nextColor;
        nextColor = newColor;
      }

      const lowerRange = Math.round(colors[i].pos / 100 * this.steps);
      const upperRange = Math.round(colors[i + 1].pos / 100 * this.steps);
      if (upperRange < 1) continue;
      if (lowerRange === upperRange) continue;

      this.gradients.push(
        new RgbTwoStopGradient(
          currentColor.rgb,
          nextColor.rgb,
          lowerRange,
          upperRange,
        ),
      );
    }
  }

  /**
   * Gets the next color in the gradient sequence as an array of 3 numbers: [r, g, b]
   */
  next() {
    if (this.steps < 1) return this.colors[0].rgb;

    const adjustedStep = Math.round(Math.abs(((2 * Math.asin(Math.sin(this.step * (Math.PI / (2 * this.steps))))) / Math.PI) * this.steps));
    let color;
    if (this.gradients.length < 2) {
      color = this.gradients[0].colorAt(adjustedStep);
    }
    else {
      const gradient = this.gradients.find(g => g.lowerRange <= adjustedStep && g.upperRange >= adjustedStep);
      if (!gradient) return this.colors[0].rgb;
      color = gradient.colorAt(adjustedStep);
    }

    this.step++;
    return color;
  }
}

/**
 * Two-stop gradient in RGB color space.
 * Interpolates linearly between two RGB colors.
 */
class RgbTwoStopGradient {
  startColor: number[];
  endColor: number[];
  lowerRange: number;
  upperRange: number;

  constructor(startColor: number[], endColor: number[], lowerRange: number, upperRange: number) {
    this.startColor = startColor;
    this.endColor = endColor;
    this.lowerRange = lowerRange;
    this.upperRange = upperRange;
  }

  colorAt(step: number) {
    if (this.startColor === this.endColor) return this.startColor;
    return [
      this.calculateHexPiece(step, this.startColor[0], this.endColor[0]),
      this.calculateHexPiece(step, this.startColor[1], this.endColor[1]),
      this.calculateHexPiece(step, this.startColor[2], this.endColor[2]),
    ];
  }

  calculateHexPiece(step: number, channelStart: number, channelEnd: number) {
    const range = this.upperRange - this.lowerRange;
    const interval = (channelEnd - channelStart) / range;
    return Math.round(interval * (step - this.lowerRange) + channelStart);
  }
}

/**
 * Animated gradient in RGB color space with offset support.
 */
export class RgbAnimatedGradient extends RgbGradient {
  constructor(colors: { rgb: number[], pos: number }[], numSteps: number, offset: number) {
    if (numSteps < 2) numSteps = 2;
    if (offset < 0) offset = 0;
    super(colors, numSteps);
    this.step = offset;
  }
}
