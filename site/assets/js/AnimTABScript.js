// elements for obtaining vals
const animationName = document.getElementById('animationName');
const animationText = document.getElementById('animationText');
const animationTypes = document.getElementById('animationType');
const animationFormatting = document.getElementById('animationFormatting');
const animation = document.getElementById('animation');
const speed = document.getElementById('animation-speed');

const formats = {
  0: {
    outputPrefix: '',
    template: '&#$1$2$3$4$5$6',
    formatChar: '&',
  },
  1: {
    outputPrefix: '',
    template: '&x&$1&$2&$3&$4&$5&$6$f$c',
    formatChar: '&',
  },
  2: {
    custom: true,
  },
};
let updatespeed;
let inputDelay;

let activeColors = 2;

class AnimatedGradient extends Gradient {
  constructor(colors, numSteps, offset) {
    super(colors, numSteps);
    this.step = offset;
  }
}

const outputFormat = document.getElementById('output-format');
const customFormatWrapper = document.getElementById('customFormatWrapper');
const customFormat = document.getElementById('customFormat');
function updateOutputText() {
  const format = formats[outputFormat.value];

  if (format.custom) customFormatWrapper.classList.remove('hidden');
  else customFormatWrapper.classList.add('hidden');

  let newNick = animationText.value;
  if (!newNick) {
    newNick = 'Type something!';
  }

  const bold = boldElement.checked;
  const italic = italicElement.checked;
  const underline = underlineElement.checked;
  const strike = strikeElement.checked;

  const outputText = document.getElementById('outputText');
  const outputArray = [];
  let finalOutput = [];
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
        let hexOutput = format.template;
        for (let n = 1; n <= 6; n++) {hexOutput = hexOutput.replace(`$${n}`, hex.charAt(n - 1));}
        output += hexOutput;
        if (bold) output += format.formatChar + 'l';
        if (italic) output += format.formatChar + 'o';
        if (underline) output += format.formatChar + 'n';
        if (strike) output += format.formatChar + 'm';
        output += char;
      }
      outputArray.push(`  - "${output}"`);
    }
    finalOutput = outputArray.reverse();
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
        let hexOutput = format.template;
        for (let n = 1; n <= 6; n++) {hexOutput = hexOutput.replace(`$${n}`, hex.charAt(n - 1));}
        output += hexOutput;
        if (bold) output += format.formatChar + 'l';
        if (italic) output += format.formatChar + 'o';
        if (underline) output += format.formatChar + 'n';
        if (strike) output += format.formatChar + 'm';
        output += char;
      }
      outputArray.push(`  - "${output}"`);
    }
    finalOutput = outputArray;
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
        let hexOutput = format.template;
        for (let n = 1; n <= 6; n++) {hexOutput = hexOutput.replace(`$${n}`, hex.charAt(n - 1));}
        output += hexOutput;
        if (bold) output += format.formatChar + 'l';
        if (italic) output += format.formatChar + 'o';
        if (underline) output += format.formatChar + 'n';
        if (strike) output += format.formatChar + 'm';
        output += char;
      }

      output1.push(`  - "${output}"`);
      output2.push(`  - "${output}"`);
    }
    finalOutput = output1.reverse().concat(output2);
  }
 else if (animationTypes.value == '3') {
    for (let n = 0; n < newNick.length * 2 - 2; n++) {
      const colors = [];
      const gradient = new AnimatedGradient(getColors(), newNick.length, n);
      let output = format.outputPrefix;

      const hex = convertToHex(gradient.next());
      colors.push(hex);
      let hexOutput = format.template;
      for (let n = 1; n <= 6; n++) {hexOutput = hexOutput.replace(`$${n}`, hex.charAt(n - 1));}
      output += hexOutput;
      if (bold) output += format.formatChar + 'l';
      if (italic) output += format.formatChar + 'o';
      if (underline) output += format.formatChar + 'n';
      if (strike) output += format.formatChar + 'm';
      outputArray.push(`  - "${output + newNick}"`);
    }
    finalOutput = outputArray;
  }
  outputText.innerText = animationFormatting.value.replace("%name%", animationName.value).replace("%speed%", clampedSpeed).replace("%output%", finalOutput.join("\n")).replaceAll("\\n", "\n");
  // Generate the actual text animation
  let step = 0;
  clearInterval(updatespeed);
  updatespeed = setInterval(() => {
    const colors = [];
    if (animationTypes.value == '0') {
      const gradient = new AnimatedGradient(getColors(), newNick.length * 2, step++);
      for (let i = 0; i < newNick.length * 2; i++) {
        if (newNick.charAt(i) != ' ') colors.push(convertToHex(gradient.next()));
      }
      displayColoredName(newNick, colors.reverse(), false);
    }
    else if (animationTypes.value == '1') {
      const gradient = new AnimatedGradient(getColors(), newNick.length * 2, step++);
      for (let i = 0; i < newNick.length * 2; i++) {
        if (newNick.charAt(i) != ' ') colors.push(convertToHex(gradient.next()));
      }
      displayColoredName(newNick, colors, false);
    }
    else if (animationTypes.value == '2') {
      const gradient = new AnimatedGradient(getColors(), newNick.length, step++);
      for (let i = 0; i < newNick.length; i++) {
        if (newNick.charAt(i) != ' ') colors.push(convertToHex(gradient.next()));
      }
      displayColoredName("Pls fix i have no idea anymore", colors, false);
    }else if(animationTypes.value == '3'){
      const gradient = new AnimatedGradient(getColors(), newNick.length * 2, step++);
      for (let i = 0; i < newNick.length; i++) {
        if (newNick.charAt(i)) colors.push(convertToHex(gradient.next()));
      }
      displayColoredName(newNick, colors, true);
    }
  }, clampedSpeed);
  showError(speed.value % 50 != 0);
}

function displayColoredName(nickName, colors, fulltext) {
  animation.classList.remove('minecraftbold', 'minecraftibold', 'minecraftitalic');
  if (boldElement.checked) {
    if (italicElement.checked) animation.classList.add('minecraftibold');
    else animation.classList.add('minecraftbold');
  }
  else if (italicElement.checked) {
    animation.classList.add('minecraftitalic');
  }
  animation.innerHTML = '';
  let colorIndex = 0;
  if(fulltext){
    const animationSpan = document.createElement('span');
    if (underlineElement.checked) {
      if (strikeElement.checked) animationSpan.classList.add('minecraftustrike');
      else animationSpan.classList.add('minecraftunderline');
    }
    else if (strikeElement.checked) {
      animationSpan.classList.add('minecraftstrike');
    }

    animationSpan.style.color = `#${colors[colorIndex]}`;
    animationSpan.textContent = nickName;
    animation.append(animationSpan);
  }else{
    for (let i = 0; i < nickName.length; i++) {
      const animationSpan = document.createElement('span');
      if (underlineElement.checked) {
        if (strikeElement.checked) animationSpan.classList.add('minecraftustrike');
        else animationSpan.classList.add('minecraftunderline');
      }
      else if (strikeElement.checked) {
        animationSpan.classList.add('minecraftstrike');
      }

      const char = nickName[i];
      if (char != ' ') colorIndex++;
      animationSpan.style.color = `#${colors[colorIndex]}`;
      animationSpan.textContent = char;
      animation.append(animationSpan);
    }
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

toggleColors(activeColors);
updateOutputText();