$(document).ready(function() {
    $('#presets').DataTable();
});


function createPreview(preset, button) {
    const El = button;
    const decodedpreset = decodeGradient(preset);
    const text = decodedpreset.text;
    const formats = decodedpreset.formats;
    const rgb = [];
    decodedpreset.colors.forEach(color => {
      rgb.push(convertToRGB(color));
    });
    const gradient = new Gradient(rgb, text.replace(/ /g, '').length);
    const colors = [];
    for (let i = 0; i < text.length; i++) {
      const char = text.charAt(i);
      if (char == ' ') {
        colors.push(null);
        continue;
      }
      const hex = convertToHex(gradient.next());
      colors.push(hex);
    }
    El.classList.remove('minecraftbold', 'minecraftibold', 'minecraftitalic');

    if (formats) {
      if (formats[0]) {
        if (formats[1]) El.classList.add('minecraftibold');
        else El.classList.add('minecraftbold');
      }
      else if (formats[1]) {
        El.classList.add('minecraftitalic');
      }
    }
    El.innerHTML = '';
    for (let i = 0; i < text.length; i++) {
      const letter = document.createElement('span');
      if (formats[2]) {
        if (formats[3]) letter.classList.add('minecraftustrike');
        else letter.classList.add('minecraftunderline');
      }
      else if (formats[3]) {
        letter.classList.add('minecraftstrike');
      }
      letter.style.color = `#${colors[i]}`;
      letter.textContent = text[i];
      El.append(letter);
    }
  }

function fromBinary(encoded) {
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return String.fromCharCode(...new Uint16Array(bytes.buffer));
}

function decodeGradient(preset) {
    preset = fromBinary(preset);
    preset = JSON.parse(preset);
    const colors = preset.colors;
    const text = preset.text;
    const formats = decompress(preset.formats, 4);
    return { colors, text, formats };
}