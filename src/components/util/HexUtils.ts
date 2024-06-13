/**
 * Typescript implementation of HexUtils Gradients from RoseGarden.
 * https://github.com/Rosewood-Development/RoseGarden/blob/master/src/main/java/dev/rosewood/rosegarden/utils/HexUtils.java#L358
 * Modified to work with custom gradient points.
 */
export class Gradient {
  colors: { rgb: number[], pos: number }[];
  gradients: TwoStopGradient[];
  steps: number;
  step: number;

  constructor(colors: Gradient['colors'], numSteps: number) {
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

      const lowerRange = Math.round(colors[i].pos / 100 * numSteps);
      const upperRange = Math.round(colors[i + 1].pos / 100 * numSteps);
      if (lowerRange === upperRange) continue;

      this.gradients.push(
        new TwoStopGradient(
          currentColor.rgb,
          nextColor.rgb,
          lowerRange,
          upperRange,
        ),
      );
    }
  }

  /* Gets the next color in the gradient sequence as an array of 3 numbers: [r, g, b] */
  next() {
    if (this.steps <= 1) { return this.colors[0].rgb; }

    const adjustedStep = Math.round(Math.abs(((2 * Math.asin(Math.sin(this.step * (Math.PI / (2 * this.steps))))) / Math.PI) * this.steps));
    let color;
    if (this.gradients.length < 2) {
      color = this.gradients[0].colorAt(adjustedStep);
    }
    else {
      const gradient = this.gradients.find(g => g.lowerRange <= adjustedStep && g.upperRange >= adjustedStep);
      color = gradient?.colorAt(adjustedStep);
    }

    this.step++;
    return color;
  }
}

class TwoStopGradient {
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

export class AnimatedGradient extends Gradient {
  constructor(colors: Gradient['colors'], numSteps: number, offset: number) {
    super(colors, numSteps);
    this.step = offset;
  }
}