// elements for obtaining vals
const val1El = document.getElementById("color1");
const val2El = document.getElementById("color2");
var stepsEl = document.getElementById("steps");
const nickName = document.getElementById("nickname");
const animatedNick = document.getElementById("animatedNick");
var newNick = nickName.value;
var rgbtype = 'Essentials (&#rrggbb)';

function copyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  document.execCommand('copy');
  alert('Copied output!')
  document.body.removeChild(textArea);
}

if (window.location !== window.parent.location) {
  nickName.value = 'Nether Depths';
  document.getElementById("title").style.display = 'none';
  document.getElementById("graylabel1").style.display = 'none';
}

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches){
  document.getElementById('darkmode').checked = true;
  darkMode();
}


function darkMode() {
  if (document.getElementById('darkmode').checked == true) {
    document.body.classList.add('dark');
    document.getElementById('graylabel1').classList.replace("gray", "darkgray");
    document.getElementById('graylabel2').classList.replace("gray", "darkgray");
    document.getElementById('error').classList.replace("errortext", "darkerrortext");
    document.getElementById('color1').classList.add("darktextboxes");
    document.getElementById('color2').classList.add("darktextboxes");
    nickName.classList.add("darktextboxes");
    document.getElementById('spitter').classList.add("darktextboxes");
  } else {
    document.body.classList.remove('dark');
    document.getElementById('graylabel1').classList.replace("darkgray", "gray");
    document.getElementById('graylabel2').classList.replace("darkgray", "gray");
    document.getElementById('error').classList.replace("darkerrortext", "errortext");
    document.getElementById('color1').classList.remove("darktextboxes");
    document.getElementById('color2').classList.remove("darktextboxes");
    nickName.classList.remove("darktextboxes");
    document.getElementById('spitter').classList.remove("darktextboxes");
  }
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
  var s = "0123456789abcdef";
  var i = parseInt (c);
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
  var color = [];
  color[0] = parseInt ((trim(hex)).substring (0, 2), 16);
  color[1] = parseInt ((trim(hex)).substring (2, 4), 16);
  color[2] = parseInt ((trim(hex)).substring (4, 6), 16);
  return color;
}

function generateColor(colorStart,colorEnd,colorCount){

	// The beginning of your gradient
	var start = convertToRGB (colorStart);    

	// The end of your gradient
	var end   = convertToRGB (colorEnd);    

	// The number of colors to compute
	var len = colorCount;

	//Alpha blending amount
	var alpha = 0.0;

	var saida = [];
	
	for (i = 0; i < len; i++) {
		var c = [];
		alpha += (1.0/len);
		
		c[0] = start[0] * alpha + (1 - alpha) * end[0];
		c[1] = start[1] * alpha + (1 - alpha) * end[1];
		c[2] = start[2] * alpha + (1 - alpha) * end[2];

		saida.push(convertToHex (c));
		
	}
	
	return saida;
	
}

function updateSpitter(event) {
  nickName.value = nickName.value.replace('  ', ' ');
  rgbtype = 'Essentials (&#rrggbb)';
  if (rgbtype.includes('/nick')) {
    nickName.value = nickName.value.replace(/ /g, '');
    if(nickName.value != '') {
      var letters = /^[0-9a-zA-Z_]+$/;
      if(!nickName.value.match(letters)) nickName.value = nickName.value.replace(event.data, '');
      if(!nickName.value.match(letters)) nickName.value = 'Gradieeennnttt';
    }
  }
  if (rgbtype.includes('/ranknick')) {
    nickName.value = nickName.value.toUpperCase();
    document.getElementById('bold').checked = true
    document.getElementById('italics').checked = false
    document.getElementById('underline').checked = false
    document.getElementById('strike').checked = false
  }
  newNick = nickName.value
  if(newNick == '') {
    newNick = 'Type something!'
  }
  
  var essentialscolorsout = [];
  var luckpermscolorsout = [];
  var othercolorsout = [];
  // the pre element where we spit array to user
  var spitter = document.getElementById("spitter");

  var colors = generateColor(val2El.value,val1El.value,newNick.length);

  var nickspaced = newNick.split("");
  var colorspp = ('&' + colors.join('').split('').join('&')).match(/.{1,12}/g);
  for (var i = 0; i < newNick.length; i++) {
    colorspp[i] = colorspp[i].replace('&', '&x&');
    if (document.getElementById('bold').checked == true) nickspaced[i] = '&l' + nickspaced[i];
    if (document.getElementById('italics').checked == true) nickspaced[i] = '&o' + nickspaced[i];
    if (document.getElementById('underline').checked == true) nickspaced[i] = '&n' + nickspaced[i];
    if (document.getElementById('strike').checked == true) nickspaced[i] = '&m' + nickspaced[i];
    essentialscolorsout[i] = '&#' + colors[i] + nickspaced[i]
    luckpermscolorsout[i] = '{#' + colors[i] + '}' + nickspaced[i]
    othercolorsout[i] = colorspp[i] + nickspaced[i]
  }
  var output = ''
  if (rgbtype.includes('x')) {
    if (rgbtype.includes('§')) {
      output = othercolorsout.join('').replace(/&/g, '§');
    } else {
      output = othercolorsout.join('');
    }
  } else if (rgbtype.includes('&#')) {
    output = essentialscolorsout.join('');
  } else {
    output = luckpermscolorsout.join('');
  }
  var num = '';
  if (rgbtype.includes('&#')) num = 8;
  if (rgbtype.includes('{#')) num = 9;
  if (rgbtype.includes('x')) num = 14;
  if (document.getElementById('bold').checked == true) num = num+2;
  if (document.getElementById('italics').checked == true) num = num+2;
  if (document.getElementById('underline').checked == true) num = num+2;
  if (document.getElementById('strike').checked == true) num = num+2;
  if (rgbtype.includes('/nick')) output = '/nick ' + output;
  if (rgbtype.includes('/ranknick')) output = '/ranknick set ' + output;
  if (num == 8) output = output.replace(/.{8}(?=\ )/g, '');
  if (num == 9) output = output.replace(/.{9}(?=\ )/g, '');
  if (num == 10) output = output.replace(/.{10}(?=\ )/g, '');
  if (num == 11) output = output.replace(/.{11}(?=\ )/g, '');
  if (num == 12) output = output.replace(/.{12}(?=\ )/g, '');
  if (num == 13) output = output.replace(/.{13}(?=\ )/g, '');
  if (num == 14) output = output.replace(/.{14}(?=\ )/g, '');
  if (num == 15) output = output.replace(/.{15}(?=\ )/g, '');
  if (num == 16) output = output.replace(/.{16}(?=\ )/g, '');
  if (num == 17) output = output.replace(/.{17}(?=\ )/g, '');
  if (num == 18) output = output.replace(/.{18}(?=\ )/g, '');
  if (num == 19) output = output.replace(/.{19}(?=\ )/g, '');
  if (num == 20) output = output.replace(/.{20}(?=\ )/g, '');
  if (num == 20) output = output.replace(/.{21}(?=\ )/g, '');
  if (num == 20) output = output.replace(/.{22}(?=\ )/g, '');
    const animatedoutput = [];
    colors.forEach(color => {
      colors.push(color);
    })
    let output2 = output
    colors.forEach(color => {
      animatedoutput.push(`\n      - "${output2}"`);
    })
    spitter.innerText = '  gradientanimation:\n    change-interval: 50\n    texts:' + animatedoutput.join('');
    document.getElementById('graylabel2').innerText = 'This output is compatible with the TAB config.';
    document.getElementById('spitter').style.height = "360px";
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
    animatedNick.style.display = 'block';
    animatedNick.style.background = `linear-gradient(to right, ${val2El.value}, ${val1El.value}, ${val2El.value})`;
    animatedNick.style.webkitBackgroundClip = 'text';
    animatedNick.style.backgroundClip = 'text';
    animatedNick.style.color = 'transparent';
    animatedNick.style.animation = 'rainbow_animation 1s linear';
    animatedNick.style.animationIterationCount = 'infinite';
    animatedNick.style.backgroundSize = '50% 100%';
    animatedNick.textContent = nickName
    animatedNick.classList.remove('minecraftbold', 'minecraftibold', 'minecraftitalic');
    animatedNick.classList.remove('minecraftustrike', 'minecraftunderline', 'minecraftstrike');
  if (document.getElementById('bold').checked == true) {
    if (document.getElementById('italics').checked == true) {
      animatedNick.classList.add('minecraftibold');
    } else {
      animatedNick.classList.add('minecraftbold');
    }
  } else if (document.getElementById('italics').checked == true) {
    animatedNick.classList.add('minecraftitalic');
  }
  if (document.getElementById('underline').checked == true) {
    if (document.getElementById('strike').checked == true) {
      animatedNick.classList.add('minecraftustrike');
    } else animatedNick.classList.add('minecraftunderline');
  } else if (document.getElementById('strike').checked == true) {
    animatedNick.classList.add('minecraftstrike');
  }
}