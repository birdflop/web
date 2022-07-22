// elements for obtaining vals
const animationText = document.getElementById('animationText');
const animationTypes = document.getElementById('animationType');
const animation = document.getElementById('animation');
const speed = document.getElementById('animation-speed');
const savedColors = ['00FFE0', 'EB00FF', getRandomHexColor(), getRandomHexColor(), getRandomHexColor(), getRandomHexColor(), getRandomHexColor(), getRandomHexColor(), getRandomHexColor(), getRandomHexColor()];
const formats = {
  0: {
    outputPrefix: '',
    color: '&#$1$2$3$4$5$6',
    char: '&',
  },
};
let updatespeed;
let inputDelay;

function showError() {
  if (speed.value % 50 != 0) {
    document.getElementById('error').style.display = 'block';
  }
 else {
    document.getElementById('error').style.display = 'none';
  }
}

/**
 * JavaScript implementation of HexUtils Gradients from RoseGarden.
 * https://github.com/Rosewood-Development/RoseGarden/blob/master/src/main/java/dev/rosewood/rosegarden/utils/HexUtils.java#L358
 */
class Gradient {
  constructor(colors, numSteps) {
    this.colors = colors;
    this.gradients = [];
    this.steps = numSteps - 1;
    this.step = 0;

    const increment = this.steps / (colors.length - 1);
    for (let i = 0; i < colors.length - 1; i++) {this.gradients.push(new TwoStopGradient(colors[i], colors[i + 1], increment * i, increment * (i + 1)));}
  }

  /* Gets the next color in the gradient sequence as an array of 3 numbers: [r, g, b] */
  next() {
    if (this.steps <= 1) {return this.colors[0];}

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

class AnimatedGradient extends Gradient {
  constructor(colors, numSteps, offset) {
    super(colors, numSteps);
    this.step = offset;
  }
}

class TwoStopGradient {
  constructor(startColor, endColor, lowerRange, upperRange) {
    this.startColor = startColor;
    this.endColor = endColor;
    this.lowerRange = lowerRange;
    this.upperRange = upperRange;
  }

  colorAt(step) {
    return [
      this.calculateHexPiece(step, this.startColor[0], this.endColor[0]),
      this.calculateHexPiece(step, this.startColor[1], this.endColor[1]),
      this.calculateHexPiece(step, this.startColor[2], this.endColor[2]),
    ];
  }

  calculateHexPiece(step, channelStart, channelEnd) {
    const range = this.upperRange - this.lowerRange;
    const interval = (channelEnd - channelStart) / range;
    return Math.round(interval * (step - this.lowerRange) + channelStart);
  }
}

function updateOutputText() {
  const format = formats[0];
  let newNick = animationText.value;
  if (!newNick) {
    newNick = 'Type something!';
  }

  const bold = document.getElementById('bold').checked;
  const italic = document.getElementById('italics').checked;
  const underline = document.getElementById('underline').checked;
  const strike = document.getElementById('strike').checked;

  const outputText = document.getElementById('outputText');
  const outputArray = [];
  const clampedSpeed = Math.ceil(speed.value / 50) * 50;
  outputText.innerText = '';

  // Generate the output text
  if (animationTypes.value == '0') {
    for (let n = 0; n < newNick.length * 2 - 2; n++) {
      const colors = [];
      const gradient = new AnimatedGradient(getColors(), newNick.length, n);
      let output = format.outputPrefix;
      for (let i = 0; i < newNick.length; i++) {
        const char = newNick.charAt(i);
        if (char == ' ') {
          output += char;
          colors.push(null);
          continue;
        }

        const hex = convertToHex(gradient.next());
        colors.push(hex);
        let hexOutput = format.color;
        for (let n = 1; n <= 6; n++) {hexOutput = hexOutput.replace(`$${n}`, hex.charAt(n - 1));}
        output += hexOutput;
        if (bold) output += format.char + 'l';
        if (italic) output += format.char + 'o';
        if (underline) output += format.char + 'n';
        if (strike) output += format.char + 'm';
        output += char;
      }

      outputText.innerText = `  - "${output}"\n${outputText.innerText}`;
    }
    outputText.innerText = `logo:\n  change-interval: ${clampedSpeed}\n  texts:\n${outputText.innerText}`;
  }
 else if (animationTypes.value == '1') {
    for (let n = 0; n < newNick.length * 2 - 2; n++) {
      const colors = [];
      const gradient = new AnimatedGradient(getColors(), newNick.length, n);
      let output = format.outputPrefix;
      for (let i = 0; i < newNick.length; i++) {
        const char = newNick.charAt(i);
        if (char == ' ') {
          output += char;
          colors.push(null);
          continue;
        }

        const hex = convertToHex(gradient.next());
        colors.push(hex);
        let hexOutput = format.color;
        for (let n = 1; n <= 6; n++) {hexOutput = hexOutput.replace(`$${n}`, hex.charAt(n - 1));}
        output += hexOutput;
        if (bold) output += format.char + 'l';
        if (italic) output += format.char + 'o';
        if (underline) output += format.char + 'n';
        if (strike) output += format.char + 'm';
        output += char;
      }

      outputArray.push(`  - "${output}"`);
    }
    outputText.innerText = `logo:\n  change-interval: ${clampedSpeed}\n  texts:\n${outputArray.join("\n")}`;
  }
 else if (animationTypes.value == '2') {
    const output1 = [];
    const output2 = [];
    for (let n = 0; n < newNick.length; n++) {
      const colors = [];
      const gradient = new AnimatedGradient(getColors(), newNick.length, n);
      let output = format.outputPrefix;
      for (let i = 0; i < newNick.length; i++) {
        const char = newNick.charAt(i);
        if (char == ' ') {
          output += char;
          colors.push(null);
          continue;
        }

        const hex = convertToHex(gradient.next());
        colors.push(hex);
        let hexOutput = format.color;
        for (let n = 1; n <= 6; n++) {hexOutput = hexOutput.replace(`$${n}`, hex.charAt(n - 1));}
        output += hexOutput;
        if (bold) output += format.char + 'l';
        if (italic) output += format.char + 'o';
        if (underline) output += format.char + 'n';
        if (strike) output += format.char + 'm';
        output += char;
      }

      output1.push(`  - "${output}"`);
    }
    for (let n = 0; n < newNick.length; n++) {
      const colors = [];
      const gradient = new AnimatedGradient(getColors(), newNick.length, n);
      let output = format.outputPrefix;
      for (let i = 0; i < newNick.length; i++) {
        const char = newNick.charAt(i);
        if (char == ' ') {
          output += char;
          colors.push(null);
          continue;
        }

        const hex = convertToHex(gradient.next());
        colors.push(hex);
        let hexOutput = format.color;
        for (let n = 1; n <= 6; n++) {hexOutput = hexOutput.replace(`$${n}`, hex.charAt(n - 1));}
        output += hexOutput;
        if (bold) output += format.char + 'l';
        if (italic) output += format.char + 'o';
        if (underline) output += format.char + 'n';
        if (strike) output += format.char + 'm';
        output += char;
      }

      output2.push(`  - "${output}"`);
    }
    outputText.innerText = `logo:\n  change-interval: ${clampedSpeed}\n  texts:\n${output1.reverse().concat(output2).join("\n")}`;
  }
 else if (animationTypes.value == '3') {
    for (let n = 0; n < newNick.length * 2 - 2; n++) {
      const colors = [];
      const gradient = new AnimatedGradient(getColors(), newNick.length, n);
      let output = format.outputPrefix;
      for (let i = 0; i < newNick.length; i++) {
        const char = newNick.charAt(i);
        if (char == ' ') {
          output += char;
          colors.push(null);
          continue;
        }

        const hex = convertToHex(gradient.next());
        colors.push(hex);
        let hexOutput = format.color;
        for (let n = 1; n <= 6; n++) {hexOutput = hexOutput.replace(`$${n}`, hex.charAt(n - 1));}
        output += hexOutput;
        if (bold) output += format.char + 'l';
        if (italic) output += format.char + 'o';
        if (underline) output += format.char + 'n';
        if (strike) output += format.char + 'm';
        output += char;
      }

      outputArray.push(`  - "${output}"`);
    }
    outputText.innerText = `logo:\n  change-interval: ${clampedSpeed}\n  texts:\n${outputArray.join("\n")}`;
  }

  // Generate the actual text animation
  let step = 0;
  clearInterval(updatespeed);
  updatespeed = setInterval(() => {
    const colors = [];
    let colors2 = [];
    if(animationTypes.value == '0') {
      const gradient = new AnimatedGradient(getColors(), newNick.length * 2, step++);
      for (let i = 0; i < newNick.length * 2; i++) {
        if (newNick.charAt(i) != ' ') {colors.push(convertToHex(gradient.next()));}
      }
      displayColoredName(newNick, colors.reverse());
    }
 else if (animationTypes.value == '1') {
      const gradient = new AnimatedGradient(getColors(), newNick.length * 2, step++);
      for (let i = 0; i < newNick.length * 2; i++) {
        if (newNick.charAt(i) != ' ') {colors.push(convertToHex(gradient.next()));}
      }
      displayColoredName(newNick, colors);
    }
 else if (animationTypes.value == '2') {
      const gradient = new AnimatedGradient(getColors(), newNick.length, step++);
      for (let i = 0; i < newNick.length * 2; i++) {
        if (newNick.charAt(i) != ' ') {colors.push(convertToHex(gradient.next()));}
          colors2.push(convertToHex(gradient.next()));
      }
      colors2 = colors.concat(colors.reverse());
      displayColoredName("Preview Broken fixing soon", colors2);
      console.log(colors2);
    }
  }, clampedSpeed);
  showError();
}

function displayColoredName(nickName, colors) {
  animation.classList.remove('minecraftbold', 'minecraftibold', 'minecraftitalic');
  if (document.getElementById('bold').checked) {
    if (document.getElementById('italics').checked) {
      animation.classList.add('minecraftibold');
    }
 else {
      animation.classList.add('minecraftbold');
    }
  }
 else if (document.getElementById('italics').checked) {
    animation.classList.add('minecraftitalic');
  }
  animation.innerHTML = '';
  let colorIndex = 0;
  for (let i = 0; i < nickName.length; i++) {
    const animationSpan = document.createElement('span');
    if (document.getElementById('underline').checked) {
      if (document.getElementById('strike').checked) {
        animationSpan.classList.add('minecraftustrike');
      }
 else {animationSpan.classList.add('minecraftunderline');}
    }
 else if (document.getElementById('strike').checked) {
      animationSpan.classList.add('minecraftstrike');
    }

    const char = nickName[i];
    if (char != ' ') colorIndex++;
    animationSpan.style.color = `#${colors[colorIndex]}`;
    animationSpan.textContent = char;
    animation.append(animationSpan);
  }
}

function exportPreset() {
  const hexColors = $('#hexColors').find('.hexColor');
  const colors = [];
  const bold = document.getElementById('bold').checked;
  const italic = document.getElementById('italics').checked;
  const underline = document.getElementById('underline').checked;
  const strike = document.getElementById('strike').checked;
  const formats = [bold, italic, underline, strike];
  hexColors.each((index, element) => {
    const value = $(element).val();
    savedColors[index] = value;
    colors[index] = value;
  });
  const preset = toBinary(colors + ":-:" + animationText.value + ":-:" + speed.value + ":-:" + animationTypes.value + ":-:" + compress(formats));
  return preset;
}

function importPreset(p) {
  let preset = fromBinary(p);
  preset = preset.split(":-:");
  const colors = preset[0].split(",");
  animationText.value = preset[1];
  speed.value = preset[2];
  animationTypes.value = preset[3];
  const formats = decompress(preset[4], 4);
  document.getElementById('bold').checked = formats[0];
  document.getElementById('italics').checked = formats[1];
  document.getElementById('underline').checked = formats[2];
  document.getElementById('strike').checked = formats[3];

  const container = $('#hexColors');
  container.empty();
    // Need to add some colors
    const template = $('#hexColorTemplate').html();
    for (let i = 0 + 1; i <= colors.length; i++) {
      const html = template.replace(/\$NUM/g, i).replace(/\$VAL/g, colors[i - 1]);
      container.append(html);
    }
    document.getElementById("numOfColors").value = colors.length;
    // Refresh all jscolor elements
    jscolor.install();
    try {
      updateOutputText();
    }
 catch (error) {
      alert("Invalid Preset");
    }
}

toggleColors(2);
updateOutputText();