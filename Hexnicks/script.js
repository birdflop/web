// elements for obtaining vals
let val1El = document.getElementById("color1");
let val2El = document.getElementById("color2");
let val3El = document.getElementById("color3");
let val4El = document.getElementById("color4");
let stepsEl = document.getElementById("steps");
const nickName = document.getElementById("nickname");
const coloredNick = document.getElementById("coloredNick");
const coloredNickP = document.createElement("p");
let newNick = nickName.value;
let rgbtype = 'chat (&#rrggbb)';
let numberOfColors = 2;

const hideColors = () => {
  for(const num of [3, 4]){
    for(const selector of ["label", "color"])
      document.getElementById(`${selector}${num}`).style.display = num <= numberOfColors ? "block" : "none";
  }
}

function cuttext(text, length) {
  if (text.length <= length) {
    return text;
  }

  return text.substr(0, length)
}

//copy contents to clipboard  
function copyTextToClipboard(text) {
  let textArea = document.createElement("textarea");
  textArea.value = text;

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  document.execCommand('copy');
  alert('Copied output!')
  document.body.removeChild(textArea);
}

function showError() {
  if (document.getElementById('spitter').textContent.length > "256") {
    document.getElementById('error').style.display = "block";
    document.getElementById('spitter').style.height = "70px";
    document.getElementById('spitter').style.marginBottom = "5px";
  } else {
    document.getElementById('error').style.display = "none";
    document.getElementById('spitter').style.height = "95px";
    document.getElementById('spitter').style.marginBottom = "10px";
  }
}

function hex (c) {
  let s = "0123456789abcdef";
  let i = parseInt (c);
  if (i == 0 || isNaN (c))
    return "00";
  i = Math.round (Math.min (Math.max (0, i), 255));
  return s.charAt ((i - i % 16) / 16) + s.charAt (i % 16);
}

/* Convert an RGB triplet to a hex string */
function convertToHex (rgb) {
  return hex(rgb[0]) + hex(rgb[1]) + hex(rgb[2]);
}

/* Remove '#' in color hex string */
function trim (s) { return (s.charAt(0) == '#') ? s.substring(1, 7) : s }

/* Convert a hex string to an RGB triplet */
function convertToRGB (hex) {
  let color = [];
  color[0] = parseInt ((trim(hex)).substring (0, 2), 16);
  color[1] = parseInt ((trim(hex)).substring (2, 4), 16);
  color[2] = parseInt ((trim(hex)).substring (4, 6), 16);
  return color;
}

function generateColor(colorStart,colorEnd,colorCount){

	// The beginning of your gradient
	let start = convertToRGB (colorStart);      

	// The end of your gradient
	let end   = convertToRGB (colorEnd);    

	// The number of colors to compute
	let len = colorCount;

	//Alpha blending amount
	let alpha = 0.0;

	let saida = [];
	
	for (i = 0; i < len; i++) {
		let c = [];
		alpha += (1.0/len);

		c[0] = start[0] * alpha + (1 - alpha) * end[0];
		c[1] = start[1] * alpha + (1 - alpha) * end[1];
		c[2] = start[2] * alpha + (1 - alpha) * end[2];

		saida.push(convertToHex (c));
		
	}
	
	return saida;
	
}

function CombineGradient(gradient1,gradient2) {
  result = [];
  result = gradient1.concat(gradient2)
  return result;
}

function updateSpitter(event) {
  if (rgbtype.includes('/nick')) {
    nickName.value = nickName.value.replace(/ /g, '');
    if(nickName.value != '') {
      let letters = /^[0-9a-zA-Z_]+$/;
      if(!nickName.value.match(letters)) nickName.value = nickName.value.replace(event.data, '');
      if(!nickName.value.match(letters)) nickName.value = 'EasyMC';
    }
  }
  newNick = nickName.value
  if(newNick == '') {
    newNick = 'Type something!'
  }

  let spitter = document.getElementById("spitter");
  let half = newNick.length/2
  let thirds = newNick.length/3
  let gradientHalf1 = generateColor(val2El.value,val1El.value,half)
  let gradientHalf2 = generateColor(val3El.value,val2El.value,half)
  let gradientThirds1 = generateColor(val2El.value,val1El.value,thirds)
  let gradientThirds2 = generateColor(val3El.value,val2El.value,thirds)
  let gradientThirds3 = generateColor(val4El.value,val3El.value,half+1)
  let essentialscolorsout = [];
  let othercolorsout = [];
  // the pre element where we spit array to user

  var colors
  numberOfColors == 3 ? CombineGradient(gradientHalf1,gradientHalf2) : generateColor(val2El.value,val1El.value,newNick.length)
  if (numberOfColors == 2) {
    colors = generateColor(val2El.value,val1El.value,newNick.length)
  }else if (numberOfColors == 3) {
    colors = CombineGradient(gradientHalf1,gradientHalf2)
  }else if (numberOfColors == 4) {
    let uwu = CombineGradient(gradientThirds1,gradientThirds2)
    colors = CombineGradient(uwu,gradientThirds3)
  }

  let nickspaced = newNick.split("");
  let colorspp = ('&' + colors.join('').split('').join('&')).match(/.{1,12}/g);
  for (let i = 0; i < newNick.length; i++) {
    if (document.getElementById('bold').checked == true) nickspaced[i] = '&l' + nickspaced[i];
    if (document.getElementById('italics').checked == true) nickspaced[i] = '&o' + nickspaced[i];
    if (document.getElementById('underline').checked == true) nickspaced[i] = '&n' + nickspaced[i];
    if (document.getElementById('strike').checked == true) nickspaced[i] = '&m' + nickspaced[i];
    colorspp[i] = colorspp[i].replace('&', '&x&');
    essentialscolorsout[i] = '&#' + colors[i] + nickspaced[i]
    othercolorsout[i] = colorspp[i] + nickspaced[i]
  }
  let output = ''
  if (rgbtype.includes('x')) {
    if (rgbtype.includes('§')) {
      output = othercolorsout.join('').replace(/&/g, '§');
    } else {
      output = othercolorsout.join('');
    }
  } else {
    output = essentialscolorsout.join('');
  }
  if (rgbtype.includes('/nick')) output = '/nick ' + output;
  spitter.innerText = output
  showError()
  displayColoredName(newNick, colors);
}
/**
 * padding function:
 * cba to roll my own, thanks Pointy!
 * ==================================
 * source: http://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript
 */
function pad(n, width, z) {
  z = z || "0";
  n = n + "";
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
updateSpitter();

async function displayColoredName(nickName, colors) {
  coloredNick.classList.remove('minecraftbold', 'minecraftibold', 'minecraftitalic');
  if (document.getElementById('bold').checked == true) {
    if (document.getElementById('italics').checked == true) {
      coloredNick.classList.add('minecraftibold');
    } else {
      coloredNick.classList.add('minecraftbold');
    }
  } else if (document.getElementById('italics').checked == true) {
    coloredNick.classList.add('minecraftitalic');
  }
  coloredNickP.innerHTML = "";
  for (let i = 0; i < nickName.length; i++) {
    const coloredNickSpan = document.createElement("span");
    if (document.getElementById('underline').checked == true) {
      if (document.getElementById('strike').checked == true) {
        coloredNickSpan.classList.add('minecraftustrike');
      } else coloredNickSpan.classList.add('minecraftunderline');
    } else if (document.getElementById('strike').checked == true) {
      coloredNickSpan.classList.add('minecraftstrike');
    }
    coloredNickSpan.style.color = colors[i];
    coloredNickSpan.textContent = nickName[i];
    coloredNickP.append(coloredNickSpan);
  }
  coloredNick.append(coloredNickP);
}