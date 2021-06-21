// elements for obtaining vals
let val1El = document.getElementById("color1");
let val2El = document.getElementById("color2");
let stepsEl = document.getElementById("steps");
let speed = document.getElementById("updateSpeed")
const nickName = document.getElementById("animationText");
const coloredNick = document.getElementById("coloredNick");
const coloredNickP = document.createElement("p");
let newNick = nickName.value;
let rgbtype = 'chat (&#rrggbb)';
let updatespeed;

function cuttext(text, length) {
  if (text.length <= length) {
    return text;
  }
  return text.substr(0, length)
}


function showError() {
  if (speed.value %50 != 0) {
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
let colors
function updateSpitter(event) {
  console.log(speed.value %50 === 0)
  clearInterval(updatespeed)
  newNick = nickName.value
  if(newNick == '') {
    newNick = 'Type something!'
  }
  
  let colorsout = [];
  let animationout = [];
  // the pre element where we spit array to user
  let spitter = document.getElementById("spitter");

  let colorsFirst = generateColor(val2El.value,val1El.value,newNick.length);
  let colorsSecond = generateColor(val1El.value,val2El.value,newNick.length);
  colors = CombineGradient(colorsFirst,colorsSecond)
  let wordSpaced = newNick.split("");
  for (let index = 0; index < newNick.length*2; index++) {
    for (let i = 0; i < newNick.length; i++) {
      if (document.getElementById('bold').checked == true) wordSpaced[i] = '&l' + wordSpaced[i];
      if (document.getElementById('italics').checked == true) wordSpaced[i] = '&o' + wordSpaced[i];
      if (document.getElementById('underline').checked == true) wordSpaced[i] = '&n' + wordSpaced[i];
      if (document.getElementById('strike').checked == true) wordSpaced[i] = '&m' + wordSpaced[i];
      colorsout[i] = '&#' + colors[i] + wordSpaced[i]
    }
      animationout.push("  - \""+colorsout.join("")+"\"")
    colors.unshift(colors.pop())
  }
  let output = animationout.join('\n');
    spitter.innerText = "logo:\n"+`  change-interval: ${Math.ceil(speed.value/50)*50}\n`+"  texts:\n"+output
  if (speed.value %50 === 0) {
    updatespeed = setInterval(() => {
      colors.unshift(colors.pop())
      displayColoredName(newNick, colors);
    }, speed.value); 
  }else{
    updatespeed = setInterval(() => {
      colors.unshift(colors.pop())
      displayColoredName(newNick, colors);
    }, Math.ceil(speed.value/50)*50); 
  }
  showError()
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