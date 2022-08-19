// elements for obtaining vals
const animationText = document.getElementById('animationText');
const animationTypes = document.getElementById('animationType');
const animation = document.getElementById('animation');
const speed = document.getElementById('animation-speed');

const savedColors = [];
const formats = {
  0: {
    outputPrefix: '',
    color: '&#$1$2$3$4$5$6',
    char: '&',
  },
};
let updatespeed;
let inputDelay;

let activeColors = 2;

function loadCookies() {
  // Apply cookies if set
  if (!jQuery.isEmptyObject(Cookies.get())) {
    for (let i = 1; i <= 10; i++) {
      const value = Cookies.get(`color-${i}`);
      if (value) savedColors.push(value);
      else savedColors.push(getRandomHexColor());
    }

    const colors = Cookies.get('activeColors');
    if (colors) {
      activeColors = colors;
      numOfColors.value = colors;
    }

    const text = Cookies.get('text');
    if (text) animationText.value = text;

    const animationSpeed = Cookies.get('animationSpeed');
    if (animationSpeed) speed.value = animationSpeed;

    if (Cookies.get('bold') === 'true') boldElement.checked = true;
    if (Cookies.get('italics') === 'true') italicElement.checked = true;
    if (Cookies.get('underline') === 'true') underlineElement.checked = true;
    if (Cookies.get('strike') === 'true') strikeElement.checked = true;
  }
  else {
    // Otherwise randomize them instead
    savedColors.push('00FFE0');
    savedColors.push('EB00FF');
    for (let i = 0; i < 8; i++) savedColors.push(getRandomHexColor());
    updateCookies();
  }
}

function updateCookies() {
  for (let i = 1; i <= savedColors.length; i++) Cookies.set(`color-${i}`, savedColors[i - 1], { expires: 7, path: '/AnimTab' });
  Cookies.set('activeColors', activeColors, { expires: 7, path: '/AnimTab' });
  Cookies.set('text', animationText.value, { expires: 7, path: '/AnimTab' });
  Cookies.set('animationSpeed', speed.value, { expires: 7, path: '/AnimTab' });
  Cookies.set('bold', boldElement.checked, { expires: 7, path: '/AnimTab' });
  Cookies.set('italics', italicElement.checked, { expires: 7, path: '/AnimTab' });
  Cookies.set('underline', underlineElement.checked, { expires: 7, path: '/AnimTab' });
  Cookies.set('strike', strikeElement.checked, { expires: 7, path: '/AnimTab' });
}

class AnimatedGradient extends Gradient {
  constructor(colors, numSteps, offset) {
    super(colors, numSteps);
    this.step = offset;
  }
}

function updateOutputText() {
  console.log('Updating output text');
  updateCookies();
  const format = formats[0];
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
    if (animationTypes.value == '0') {
      const gradient = new AnimatedGradient(getColors(), newNick.length * 2, step++);
      for (let i = 0; i < newNick.length * 2; i++) {
        if (newNick.charAt(i) != ' ') colors.push(convertToHex(gradient.next()));
      }
      displayColoredName(newNick, colors.reverse());
    }
    else if (animationTypes.value == '1') {
      const gradient = new AnimatedGradient(getColors(), newNick.length * 2, step++);
      for (let i = 0; i < newNick.length * 2; i++) {
        if (newNick.charAt(i) != ' ') colors.push(convertToHex(gradient.next()));
      }
      displayColoredName(newNick, colors);
    }
    else if (animationTypes.value == '2') {
      const gradient = new AnimatedGradient(getColors(), newNick.length, step++);
      for (let i = 0; i < newNick.length * 2; i++) {
        if (newNick.charAt(i) != ' ') colors.push(convertToHex(gradient.next()));
        colors2.push(convertToHex(gradient.next()));
      }
      colors2 = colors.concat(colors.reverse());
      displayColoredName("Preview Broken fixing soon", colors2);
      console.log(colors2);
    }
  }, clampedSpeed);
  showError(speed.value % 50 != 0);
}

function displayColoredName(nickName, colors) {
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

loadCookies();

toggleColors(activeColors);
updateOutputText();