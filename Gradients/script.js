// elements for obtaining vals
const nickName = document.getElementById('nickname');
const coloredNick = document.getElementById('coloredNick');
const savedColors = ['00FFE0', 'EB00FF', getRandomHexColor(), getRandomHexColor(), getRandomHexColor(), getRandomHexColor(), getRandomHexColor(), getRandomHexColor(), getRandomHexColor(), getRandomHexColor()];
const toggled = false;
const presets = {
  0: {
    colors: ["00FFE0", "EB00FF"],
    text: "SimplyMC"
  },
  1: {
    colors: ["FF0000", "FF7F00", "FFFF00", "00FF00", "0000FF", "4B0082", "9400D3"],
    text: "Rainbow"
  }
}
const formats = {
  0: {
    outputPrefix: '',
    template: '&#$1$2$3$4$5$6$f$c',
    formatChar: '&',
    maxLength: 256
  },
  1: {
    outputPrefix: '',
    template: '<#$1$2$3$4$5$6>$f$c',
    formatChar: '&',
    maxLength: 256
  },
  2: {
    outputPrefix: '',
    template: '&x&$1&$2&$3&$4&$5&$6$f$c',
    formatChar: '&',
    maxLength: 256
  },
  3: {
    outputPrefix: '/nick ',
    template: '&#$1$2$3$4$5$6$f$c',
    formatChar: '&',
    maxLength: 256
  },
  4: {
    outputPrefix: '/nick ',
    template: '<#$1$2$3$4$5$6>$f$c',
    formatChar: '&',
    maxLength: 256
  },
  5: {
    outputPrefix: '/nick ',
    template: '&x&$1&$2&$3&$4&$5&$6$f$c',
    formatChar: '&',
    maxLength: 256
  },
  6: {
    outputPrefix: '',
    template: '§x§$1§$2§$3§$4§$5§$6$f$c',
    formatChar: '§',
    maxLength: null
  },
  7: {
    outputPrefix: '',
    template: '[COLOR=#$1$2$3$4$5$6]$c[/COLOR]',
    formatChar: null,
    maxLength: null
  }
};

/* Get a random HEX color */
function getRandomHexColor() {
     return Math.floor(Math.random()*16777215).toString(16).toUpperCase();
}

/* Copies contents to clipboard */
function copyTextToClipboard(text) {
  let textArea = document.createElement('textarea');
  textArea.value = text;

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  document.execCommand('copy');
  alert('Copied to clipboard!');
  document.body.removeChild(textArea);
}

function showError(show) {
  if (show) {
    document.getElementById('error').style.display = 'block';
    document.getElementById('outputText').style.height = '70px';
    document.getElementById('outputText').style.marginBottom = '5px';
  } else {
    document.getElementById('error').style.display = 'none';
    document.getElementById('outputText').style.height = '95px';
    document.getElementById('outputText').style.marginBottom = '10px';
  }
}

function hex(c) {
  let s = '0123456789abcdef';
  let i = parseInt(c);
  if (i == 0 || isNaN(c))
    return '00';
  i = Math.round(Math.min(Math.max(0, i), 255));
  return s.charAt((i - i % 16) / 16) + s.charAt(i % 16);
}

/* Convert an RGB triplet to a hex string */
function convertToHex(rgb) {
  return hex(rgb[0]) + hex(rgb[1]) + hex(rgb[2]);
}

/* Remove '#' in color hex string */
function trim(s) {
  return (s.charAt(0) == '#') ? s.substring(1, 7) : s
}

/* Convert a hex string to an RGB triplet */
function convertToRGB(hex) {
  let color = [];
  color[0] = parseInt((trim(hex)).substring(0, 2), 16);
  color[1] = parseInt((trim(hex)).substring(2, 4), 16);
  color[2] = parseInt((trim(hex)).substring(4, 6), 16);
  return color;
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
    for (let i = 0; i < colors.length - 1; i++)
      this.gradients.push(new TwoStopGradient(colors[i], colors[i + 1], increment * i, increment * (i + 1)));
  }

  /* Gets the next color in the gradient sequence as an array of 3 numbers: [r, g, b] */
  next() {
    if (this.steps <= 1)
      return this.colors[0];

    const adjustedStep = Math.round(Math.abs(((2 * Math.asin(Math.sin(this.step * (Math.PI / (2 * this.steps))))) / Math.PI) * this.steps));
    let color;
    if (this.gradients.length < 2) {
      color = this.gradients[0].colorAt(adjustedStep);
    } else {
      const segment = this.steps / this.gradients.length;
      const index = Math.min(Math.floor(adjustedStep / segment), this.gradients.length - 1);
      color = this.gradients[index].colorAt(adjustedStep);
    }

    this.step++;
    return color;
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
      this.calculateHexPiece(step, this.startColor[2], this.endColor[2])
    ];
  }

  calculateHexPiece(step, channelStart, channelEnd) {
    const range = this.upperRange - this.lowerRange;
    const interval = (channelEnd - channelStart) / range;
    return Math.round(interval * (step - this.lowerRange) + channelStart);
  }
}

/* Toggles the number of gradient colors between 2 and 10 based on user input */
function toggleColors(colors) {
  let clamped = Math.min(10, Math.max(2, colors));
  if (colors == 1 || colors == '') {
    colors = getColors().length;
  } else if (colors != clamped) {
    $('#numOfColors').val(clamped);
    colors = clamped;
  }
  const container = $('#hexColors');
  const hexColors = container.find('.hexColor');
  const number = hexColors.size();
  if (number > colors) {
    // Need to remove some colors
    hexColors.each((index, element) => {
      if (index + 1 > colors) {
        savedColors[index] = $(element).val();
        $(element).parent().remove();
      }
    });
  } else if (number < colors) {
    // Need to add some colors
    let template = $('#hexColorTemplate').html();
    for (let i = number + 1; i <= colors; i++) {
      let html = template.replace(/\$NUM/g, i).replace(/\$VAL/g, savedColors[i - 1]);
      container.append(html);
    }
    jscolor.install(); // Refresh all jscolor elements
  }
}

/* Gets all colored entered by the user */
function getColors() {
  const hexColors = $('#hexColors').find('.hexColor');
  const colors = [];
  hexColors.each((index, element) => {
    const value = $(element).val();
    savedColors[index] = value;
    colors[index] = convertToRGB(value);
  });
  return colors;
}

function updateOutputText(event) {
  let format = formats[document.getElementById('output-format').value];
  if (format.outputPrefix) {
    nickName.value = nickName.value.replace(/ /g, '');
    if (nickName.value) {
      let letters = /^[0-9a-zA-Z_]+$/;
      if (!nickName.value.match(letters)) nickName.value = nickName.value.replace(event.data, '');
      if (!nickName.value.match(letters)) nickName.value = 'SimplyMC';
    }
  }

  let newNick = nickName.value
  if (!newNick) {
    newNick = 'Type something!'
  }

  const bold = document.getElementById('bold').checked;
  const italic = document.getElementById('italics').checked;
  const underline = document.getElementById('underline').checked;
  const strike = document.getElementById('strike').checked;

  let outputText = document.getElementById('outputText');
  const points = parseInt(document.getElementById('points').value);
  let gradient = new Gradient(getColors(), newNick.replace(/ /g, '').length / points);
  let charColors = [];
  let output = format.outputPrefix;
  for (let i = 0; i < newNick.length; i++) {
    let char = newNick.charAt(i);
    if (char == ' ') {
      output += char;
      charColors.push(null);
      continue;
    }

    let hex = convertToHex(gradient.next());
    charColors.push(hex);
    let hexOutput = format.template;
    for (let n = 1; n <= 6; n++)
      hexOutput = hexOutput.replace(`$${n}`, hex.charAt(n - 1));
    let formatCodes = '';
    if (format.formatChar != null) {
      if (bold) formatCodes += format.formatChar + 'l';
      if (italic) formatCodes += format.formatChar + 'o';
      if (underline) formatCodes += format.formatChar + 'n';
      if (strike) formatCodes += format.formatChar + 'm';
    }
    hexOutput = hexOutput.replace('$f', formatCodes);
    hexOutput = hexOutput.replace('$c', char);
    output += hexOutput;
  }

  outputText.innerText = output;
  showError(format.maxLength != null && format.maxLength < output.length);
  displayColoredName(newNick, charColors);
}

/**
 * padding function:
 * cba to roll my own, thanks Pointy!
 * ==================================
 * source: http://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript
 */
function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function displayColoredName(nickName, colors) {
  coloredNick.classList.remove('minecraftbold', 'minecraftibold', 'minecraftitalic');
  if (document.getElementById('bold').checked) {
    if (document.getElementById('italics').checked) {
      coloredNick.classList.add('minecraftibold');
    } else {
      coloredNick.classList.add('minecraftbold');
    }
  } else if (document.getElementById('italics').checked) {
    coloredNick.classList.add('minecraftitalic');
  }
  coloredNick.innerHTML = '';
  for (let i = 0; i < nickName.length; i++) {
    const coloredNickSpan = document.createElement('span');
    if (document.getElementById('underline').checked) {
      if (document.getElementById('strike').checked) {
        coloredNickSpan.classList.add('minecraftustrike');
      } else coloredNickSpan.classList.add('minecraftunderline');
    } else if (document.getElementById('strike').checked) {
      coloredNickSpan.classList.add('minecraftstrike');
    }
    coloredNickSpan.style.color = colors[i];
    coloredNickSpan.textContent = nickName[i];
    coloredNick.append(coloredNickSpan);
  }
}

function preset(n) {
  const colors = presets[n].colors
  const container = $('#hexColors');
  container.empty();
    // Need to add some colors
    let template = $('#hexColorTemplate').html();
    for (let i = 0 + 1; i <= colors.length; i++) {
      let html = template.replace(/\$NUM/g, i).replace(/\$VAL/g, colors[i - 1]);
      container.append(html);
    }
    nickName.value = presets[n].text
    document.getElementById("numOfColors").value = colors.length
    jscolor.install(); // Refresh all jscolor elements
}

function exportPreset() {
  const hexColors = $('#hexColors').find('.hexColor');
  const colors = [];
  hexColors.each((index, element) => {
    const value = $(element).val();
    savedColors[index] = value;
    colors[index] = value;
  });
  let preset = btoa(colors + ":-:" + nickName.value)
  return preset;
}

function importPreset(p) {
  let preset = atob(p)
  preset = preset.split(":-:")
  let colors = preset[0].split(",")
  let nickname = preset[1]
 
  const container = $('#hexColors');
  container.empty();
    // Need to add some colors
    let template = $('#hexColorTemplate').html();
    for (let i = 0 + 1; i <= colors.length; i++) {
      let html = template.replace(/\$NUM/g, i).replace(/\$VAL/g, colors[i - 1]);
      container.append(html);
    }
    nickName.value = nickname
    document.getElementById("numOfColors").value = colors.length
    jscolor.install(); // Refresh all jscolor elements
    try {
      updateOutputText()
    } catch (error) {
      alert("Invalid Preset")
    }
}

function showfield(){
  targetDiv = document.getElementById("importInput")
  if (targetDiv.style.display !== "none") {
    targetDiv.style.display = "none";
  } else {
    targetDiv.style.display = "block";
  }
}

toggleColors(2);
updateOutputText();
