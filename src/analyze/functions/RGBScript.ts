/* Get a random HEX color */
const text = document.getElementById("text");
const speed = document.getElementById('animation-speed');
const animationType = document.getElementById('animationType');
const outputFormat = document.getElementById('output-format');
const boldElement = document.getElementById('bold');
const italicElement = document.getElementById('italics');
const underlineElement = document.getElementById('underline');
const strikeElement = document.getElementById('strike');
const errorElement = document.getElementById('error');
const customFormatElement = document.getElementById('customFormat');

declare interface Preset {
  colors: string[];
  text: string;
}

export function GetPreset(preset: number) {
    const presets: Preset[] = [
        { colors: ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#9400D3"], text: "Rainbow" },
        { colors: ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#9400D3"], text: "Rainbow" },
        { colors: ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#9400D3"], text: "Rainbow" },
    ];
    return presets[preset];
}

export function getRandomHexColor() {
    return Math.floor(Math.random() * 16777215).toString(16).toUpperCase();
}

/* Copies contents to clipboard */
export function copyTextToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard!');
    });
}

export function hex(c: number) {
    const s = '0123456789abcdef';
    let i = c;
    if (i == 0 || isNaN(c)) {return '00';}
    i = Math.round(Math.min(Math.max(0, i), 255));
    return s.charAt((i - i % 16) / 16) + s.charAt(i % 16);
}

/* Convert a hex string to an RGB triplet */
export function convertToRGB(hex: string) {
  const color = [];
  color[0] = parseInt((trim(hex)).substring(0, 2), 16);
  color[1] = parseInt((trim(hex)).substring(2, 4), 16);
  color[2] = parseInt((trim(hex)).substring(4, 6), 16);
  return color;
}

/* Convert an RGB triplet to a hex string */
export function convertToHex(rgb: [number, number, number]) {
  return hex(rgb[0]) + hex(rgb[1]) + hex(rgb[2]);
}

/* Gets all colored entered by the user */
export function getColors() {
  const hexColors = $('#hexColors').find('.hexColor');
  const colors: never[] = [];
  hexColors.each((index, element) => {
    const value = $(element).val();
    savedColors[index] = value;
    colors[index] = convertToRGB(value);
  });
  return colors;
}

// Takes an array of boolean values and turns them into a number
export function compress(values: boolean[]) {
  let output = 0;
  for (let i = 0; i < values.length; i++) {
      const value = values[i];
      output |= ~~value << i;
  }
  return output;
}

// Takes a number and turns it into an array of boolean values
// Second parameter is how many values to parse out of the number
export function decompress(input: number, expectedValues: number) {
  const values = [];
  for (let i = 0; i < expectedValues; i++) {
      const value = !!((input >> i) & 1);
      values.push(value);
  }
  return values;
}

// convert a Unicode string to a string in which
// each 16-bit unit occupies only one byte
export function toBinary(string: string) {
  const codeUnits = new Uint16Array(string.length);
  for (let i = 0; i < codeUnits.length; i++) {
    codeUnits[i] = string.charCodeAt(i);
  }
  return btoa(String.fromCharCode(...new Uint8Array(codeUnits.buffer)));
}

export function fromBinary(encoded: string) {
  try {
    const binary = atob(encoded);
  }
 catch (error) {
    alert("Unable to decode preset, is it valid?");
  }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return String.fromCharCode(...new Uint16Array(bytes.buffer));
}

/* Remove '#' in color hex string */
export function trim(s: string) {
  return (s.charAt(0) == '#') ? s.substring(1, 7) : s;
}

/* Toggles the number of gradient colors between 2 and 10 based on user input */
export function toggleColors(colors: number) {
  const clamped = Math.min(10, Math.max(2, colors));
  if (colors == 1) {
    colors = getColors().length;
  }
 else if (colors != clamped) {
    $('#numOfColors').val(clamped);
    colors = clamped;
  }
  const container = $('#hexColors');
  const hexColors = container.find('.hexColor');
  const number = hexColors.length;
  if (number > colors) {
    // Need to remove some colors
    hexColors.each((index, element) => {
      if (index + 1 > colors) {
        savedColors[index] = $(element).val();
        $(element).parent().remove();
      }
    });
  }
 else if (number < colors) {
    // Need to add some colors
    const template = $('#hexColorTemplate').html();
    for (let i = number + 1; i <= colors; i++) {
      const html = template.replace(/\$NUM/g, i).replace(/\$VAL/g, savedColors[i - 1]);
      container.append(html);
    }
    // Refresh all jscolor elements
    jscolor.install();
  }
  activeColors = colors;
}

function showError(show) {
  if (show) errorElement.style.display = 'block';
  else errorElement.style.display = 'none';
}

/**
 * JavaScript implementation of HexUtils Gradients from RoseGarden.
 * https://github.com/Rosewood-Development/RoseGarden/blob/master/src/main/java/dev/rosewood/rosegarden/utils/HexUtils.java#L358
 */
export class Gradient {
  constructor(colors, numSteps) {
    this.colors = colors;
    this.gradients = [];
    this.steps = numSteps - 1;
    this.step = 0;

    const increment = this.steps / (colors.length - 1);
    for (let i = 0; i < colors.length - 1; i++) this.gradients.push(new TwoStopGradient(colors[i], colors[i + 1], increment * i, increment * (i + 1)));
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

function exportPreset() {
  const hexColors = $('#hexColors').find('.hexColor');
  const colors = [];
  const bold = boldElement.checked;
  const italic = italicElement.checked;
  const underline = underlineElement.checked;
  const strike = strikeElement.checked;
  const formats = [bold, italic, underline, strike];
  hexColors.each((index, element) => {
    const value = $(element).val();
    savedColors[index] = value;
    colors[index] = value;
  });
  const presetJSON = {
    "version": 1,
    "colors": colors,
    "text": text.value,
    "speed": speed ? speed.value : 50,
    "formats": compress(formats),
    "output-format": outputFormat ? outputFormat.value : 0,
    "custom-format": customFormatElement ? customFormatElement.value : "&#$1$2$3$4$5$6$c",
    "type": animationType ? animationType.value : 0,
  };
  console.log(presetJSON);
  const preset = toBinary(JSON.stringify(presetJSON));
  return preset;
}

function importPreset(p) {
  let preset = fromBinary(p);
  try{
    preset = JSON.parse(preset);
  }
catch(e) {
    alert("Invalid preset!");
    return;
  }
  const colors = preset.colors;
  text.value = preset.text;
  if(speed) {
    speed.value = preset.speed;
  }
  if(animationType) {
    animationTypes.value = preset.type;
  }
  if(outputFormat) {
    outputFormat.value = preset["output-format"];
  }
  if(customFormatElement) {
    customFormatElement.value = preset["custom-format"];
  }
  const formats = decompress(preset.formats, 4);
  boldElement.checked = formats[0];
  italicElement.checked = formats[1];
  underlineElement.checked = formats[2];
  strikeElement.checked = formats[3];

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

function writeToElement(id, text) {
  document.getElementById(id).value = text;
}

function deleteElement(id) {
  document.getElementById(id).remove();
}

function openModal(element) {element.classList.add('is-active');}
function closeModal(element) { element.classList.remove('is-active'); }