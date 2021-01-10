// elements for obtaining vals
var val1El = document.getElementById("color1");
var val2El = document.getElementById("color2");
var stepsEl = document.getElementById("steps");
const nickName = document.getElementById("nickname");
const coloredNick = document.getElementById("coloredNick");
const coloredNickP = document.createElement("p");
const gradiantDiv = document.getElementById("colors").children;
let newNick = nickName.value;
var rgbtype = 'chat (&#rrggbb)';

console.log("#" + val1El.value)

function cuttext(text, length) {
  if (text.length <= length) {
    return text;
  }

  return text.substr(0, length)
}

// constants for switch/case checking representation type
const HEX = 1;

// get the string representation
// type and set it on the element (HEX/RGB/RGBA)
function getType(val) {
  if (val.indexOf("#") > -1) return HEX;
}

// process the value irrespective of representation type
function processValue(el) {
  switch (el.dataType) {
    case HEX: {
      return processHEX(el.value);
    }
  }
}

//copy contents to clipboard  
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


//return a workable RGB int array [r,g,b] from rgb/rgba representation
function processRGB(val) {
  var rgb = val.split("(")[1].split(")")[0].split(",");
  alert(rgb.toString());
  return [parseInt(rgb[0], 10), parseInt(rgb[1], 10), parseInt(rgb[2], 10)];
}

//return a workable RGB int array [r,g,b] from hex representation
function processHEX(val) {
  //does the hex contain extra char?
  var hex = val.length > 6 ? val.substr(1, val.length - 1) : val;
  // is it a six character hex?
  if (hex.length > 3) {
    //scrape out the numerics
    var r = hex.substr(0, 2);
    var g = hex.substr(2, 2);
    var b = hex.substr(4, 2);

    // if not six character hex,
    // then work as if its a three character hex
  } else {
    // just concat the pieces with themselves
    var r = hex.substr(0, 1) + hex.substr(0, 1);
    var g = hex.substr(1, 1) + hex.substr(1, 1);
    var b = hex.substr(2, 1) + hex.substr(2, 1);
  }
  // return our clean values
  return [parseInt(r, 16), parseInt(g, 16), parseInt(b, 16)];
}

function updateSpitter() {
  newNick = nickName.value.replace(/ /g, '').replace(/\*/g, '');
  //attach start value
  var hasSpun = 0;
  val1El.dataType = getType("#" + val1El.value);
  val2El.dataType = getType("#" + val2El.value);

  var val1RGB = processValue(val1El);
  var val2RGB = processValue(val2El);
  var colors = [
    // somewhere to dump gradient
  ];
  var colorsout = [
    //yes
  ];
  // the pre element where we spit array to user
  var spitter = document.getElementById("spitter");

  //the number of steps in the gradient
  var stepsInt = parseInt(newNick.length, 10);
  //the percentage representation of the step
  var stepsPerc = 100 / (stepsInt + 1);

  var nickspaced = newNick.split("");

  // diffs between two values
  var valClampRGB = [val2RGB[0] - val1RGB[0], val2RGB[1] - val1RGB[1], val2RGB[2] - val1RGB[2]];

  // build the color array out with color steps
  for (var i = 0; i < stepsInt; i++) {
    var clampedR = valClampRGB[0] > 0 ? pad(Math.round((valClampRGB[0] / 100) * (stepsPerc * (i + 1))).toString(16), 2) : pad(Math.round(val1RGB[0] + (valClampRGB[0] / 100) * (stepsPerc * (i + 1))).toString(16), 2);

    var clampedG = valClampRGB[1] > 0 ? pad(Math.round((valClampRGB[1] / 100) * (stepsPerc * (i + 1))).toString(16), 2) : pad(Math.round(val1RGB[1] + (valClampRGB[1] / 100) * (stepsPerc * (i + 1))).toString(16), 2);

    var clampedB = valClampRGB[2] > 0 ? pad(Math.round((valClampRGB[2] / 100) * (stepsPerc * (i + 1))).toString(16), 2) : pad(Math.round(val1RGB[2] + (valClampRGB[2] / 100) * (stepsPerc * (i + 1))).toString(16), 2);
    colors[i] = ["#", clampedR, clampedG, clampedB].join("");
    if (rgbtype.includes('&#rrggbb')) {
      colorsout[i] = ["&#", clampedR, clampedG, clampedB, nickspaced[i]].join("");
    } else {
      colorsout[i] = ["&x&", clampedR.split("").join("&") + '&', clampedG.split("").join("&") + '&', clampedB.split("").join("&"), nickspaced[i]].join("");
    }
  }
  //build div representation of gradient
  var html = [];
  for (var i = 0; i < colors.length; i++) {
    html.push("<div class='color' style='background-color:" + colors[i] + "; width:" + ((i - (i - 1)) / colors.length) * 120 + "%;'></div>");
  }
  document.getElementById("colors").innerHTML = html.join("");
  //update the pre element
  colorsout.forEach(p => { if (p.includes(' ')) { colorsout[colorsout.indexOf(p)] = ' ' } });
  if (rgbtype.includes('/nick')) {
    spitter.innerText = '/nick ' + colorsout.join('')
  } else if (rgbtype.includes('console')) {
    spitter.innerText = colorsout.join('').replace(/&/g, '§')
  } else {
    spitter.innerText = colorsout.join('')
  }

  showError()

  //bear func

  displayColoredName(cuttext(newNick, 256));
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

async function displayColoredName(nickName) {
  allColors = [];
  for (let i = 0; i < gradiantDiv.length; i++) {
    allColors.push(gradiantDiv[i].getAttribute("Style").split(";")[0].split(":")[1]);
  }

  coloredNickP.innerHTML = "";

  for (let i = 0; i < nickName.length; i++) {
    const coloredNickSpan = document.createElement("span");
    coloredNickSpan.style.color = allColors[i];
    coloredNickSpan.textContent = nickName[i];
    coloredNickP.append(coloredNickSpan);
  }
  coloredNick.append(coloredNickP);
}