// elements for obtaining vals
var val1El = document.getElementById("color1");
var val2El = document.getElementById("color2");
var stepsEl = document.getElementById("steps");
const nickName = document.getElementById("nickname");
const coloredNick = document.getElementById("coloredNick");
const coloredNickP = document.createElement("p");
const gradiantDiv = document.getElementById("colors").children;
let newNick = nickName.value;

console.log("#" + val1El.value)

function cuttext(text, length) {
  if (text.length <= length) {
    return text;
  }

  return text.substr(0, length)
}

// constants for switch/case checking representation type
const HEX = 1;
const RGB = 2;
const RGBA = 3;

// get the string representation
// type and set it on the element (HEX/RGB/RGBA)
function getType(val) {
  if (val.indexOf("#") > -1) return HEX;
  if (val.indexOf("rgb(") > -1) return RGB;
  if (val.indexOf("rgba(") > -1) return RGBA;
}

// process the value irrespective of representation type
function processValue(el) {
  switch (el.dataType) {
    case HEX: {
      return processHEX(el.value);
    }
    case RGB: {
      return processRGB(el.value);
    }
    case RGBA: {
      return processRGB(el.value);
    }
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
  newNick = nickName.value.replace(/ /g, '');
  //attach start value
  var hasSpun = 0;
  val1El.dataType = getType("#" + val1El.value);
  val2El.dataType = getType("#" + val2El.value);

  var val1RGB = processValue(val1El);
  var val2RGB = processValue(val2El);
  var colors = [
    // somewhere to dump gradient
  ];
  var essentialscolorsout = [
    //yes
  ];
  var othercolorsout = [
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
    essentialscolorsout[i] = ["&#", clampedR, clampedG, clampedB, nickspaced[i]].join("");
    othercolorsout[i] = ["&x", clampedR.split("").toString().replace(/,/g, "&"), "&", clampedG.split("").toString().replace(/,/g, "&"), "&", clampedB.split("").toString().replace(/,/g, "&"), nickspaced[i]].join("");
  }

  //build div representation of gradient
  var html = [];
  for (var i = 0; i < colors.length; i++) {
    html.push("<div class='color' style='background-color:" + colors[i] + "; width:" + ((i - (i - 1)) / colors.length) * 120 + "%;'></div>");
  }
  document.getElementById("colors").innerHTML = html.join("");
  //update the pre element
  fixedjson1 = essentialscolorsout.join('');
  spitter.innerText = `/nick ${cuttext(fixedjson1, 250)}`;

  document.getElementById("color1").innerHTML = html.join("");
  //update the pre element
  fixedjson2 = othercolorsout.join('');
  spitter1.innerText = `/nick ${cuttext(fixedjson2, 250)}`;

  if(fixedjson1.length >= 250){
  document.getElementById("warning1").innerHTML = html.join("");
  //update the pre element
  warning1.innerText = `Max minecraft chat length is 256 characters this command is ${fixedjson1.length + 6}\n characters long and has been cut to 256`;
  }else{
    document.getElementById("warning1").innerHTML = html.join("");
    //update the pre element
    warning1.innerText;
  }

  if(fixedjson2.length >= 250){
    document.getElementById("warning2").innerHTML = html.join("");
    //update the pre element
    warning2.innerText = `Max minecraft chat length is 256 characters this command is ${fixedjson2.length + 6}\n characters long and has been cut to 256`;
    }else{
      document.getElementById("warning2").innerHTML = html.join("");
      //update the pre element
      warning2.innerText;
    }

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
