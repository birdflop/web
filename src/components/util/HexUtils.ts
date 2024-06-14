/**
 * Typescript implementation of HexUtils Gradients from RoseGarden.
 * https://github.com/Rosewood-Development/RoseGarden/blob/master/src/main/java/dev/rosewood/rosegarden/utils/HexUtils.java#L358
 */
export class Gradient {
  colors: number[][];
  gradients: any[];
  steps: number;
  step: number;

  constructor(colors: number[][], numSteps: number) {
    this.colors = colors;
    this.gradients = [];
    this.steps = numSteps - 1;
    this.step = 0;

    const increment = this.steps / (colors.length - 1);
    for (let i = 0; i < colors.length - 1; i++) {
      this.gradients.push(
        new TwoStopGradient(
          colors[i],
          colors[i + 1],
          increment * i,
          increment * (i + 1)),
      );
    }
  }

  /* Gets the next color in the gradient sequence as an array of 3 numbers: [r, g, b] */
  next() {
    if (this.steps <= 1) { return this.colors[0]; }

    const adjustedStep = Math.round(Math.abs(((2 * Math.asin(Math.sin(this.step * (Math.PI / (2 * this.steps))))) / Math.PI) * this.steps));
    let color;
    if (this.gradients.length < 2) {
      color = this.gradients[0].colorAt(adjustedStep);
    }
    else {
      const segment = this.steps / this.gradients.length;
      const index = Math.min(Math.floor(adjustedStep / segment), this.gradients.length - 1);
      color = this.gradients[index].colorAt(adjustedStep);
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
  constructor(colors: number[][], numSteps: number, offset: number) {
    super(colors, numSteps);
    this.step = offset;
  }
}