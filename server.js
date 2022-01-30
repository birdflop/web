const ejs = require('ejs');
const path = require("path");
const Canvas = require('canvas');
const express = require('express');
const config = require('./config');
const bodyParser = require("body-parser");
const { buffer } = require('stream/consumers');
const app = express();

const dataDir = path.resolve(`${process.cwd()}${path.sep}site`); // The absolute path of current this directory.
const templateDir = path.resolve(`${dataDir}${path.sep}templates`); // Absolute path of ./templates directory.

app.engine('ejs', ejs.renderFile);
app.set("view engine", "ejs");
app.set('views', templateDir);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true,}),);
app.use("/", express.static(path.resolve(`${dataDir}${path.sep}assets`)));


const renderTemplate = (res, req, template, data = {}) => {
    // Default base data which passed to the ejs template by default.
    const baseData = {
        path: req.path,
    };
    // We render template using the absolute path of the template and the merged default data with the additional data provided.
    res.render(
        path.resolve(`${templateDir}${path.sep}${template}`),
        Object.assign(baseData, data),
    );
};


app.get('/', (req, res) => {
    renderTemplate(res, req, 'index.ejs');
});

app.get('/Gradients', (req, res) => {
    renderTemplate(res, req, 'Gradients.ejs');
});

app.get('/AnimTAB', (req, res) => {
    renderTemplate(res, req, 'AnimTab.ejs');
});

app.post('/api/render/gradient', (req, res) => {
    let preset = decode(req.body.preset);
    let preview = createPreview(preset.colors, preset.text);
    let output = createOutput(preset.colors, preset.text);
    res.status(200)
    res.json({
        Image: preview,
        Output: output
    })
});

app.listen(config.port, null, null);
console.log('Server started on port ' + config.port);

function decode(preset) {
    let buffer = Buffer.from(preset, 'base64')
    buffer = buffer.toString('utf8')
    let data = buffer.split(':-:')
    let colors = data[0].split(',')
    let text = data[1]
    return {colors, text}
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

const applyText = (canvas, text) => {
    const context = canvas.getContext('2d');

    // Declare a base size of the font
    let fontSize = 70;

    do {
        // Assign the font to the context and decrement it so it can be measured again
        context.font = `${fontSize -= 1}px sans-serif`;
        // Compare pixel width of the text to the canvas minus the approximate avatar size
        
    } while (context.measureText(text).width > canvas.width - 50);

    // Return the result to use in the actual canvas
    return context.font;
};


function texter(canvas, str, colors, x, y){
    let ctx = canvas.getContext('2d');
    ctx.font = applyText(canvas, str);
    for(var i = 0; i <= str.length; ++i){
        let hex = colors[i]
        var ch = str.charAt(i);
        ctx.fillStyle = '#' + hex
        ctx.fillText(ch, x, y);
        x += ctx.measureText(ch).width;
    }
}

function createPreview(colors, text){
    let newColors = []
    for(var i = 0; i < colors.length; ++i){
        newColors.push(convertToRGB(colors[i]))
    }
    let gradient = new Gradient(newColors, text.replace(/ /g, '').length);
    let outputColors = [];
    for (let i = 0; i < text.length; i++) {
        let hex = convertToHex(gradient.next());
        outputColors.push(hex);
    }
    const canvas = Canvas.createCanvas(700, 250);
    texter(canvas, text, outputColors, 10, 60);
    return canvas.toDataURL();
}

function createOutput(colors, text){
    let newColors = []
    for(var i = 0; i < colors.length; ++i){
        newColors.push(convertToRGB(colors[i]))
    }
    let gradient = new Gradient(newColors, text.replace(/ /g, '').length);
    let output = [];
    for (let i = 0; i < text.length; i++) {
        let hex = convertToHex(gradient.next());
        let char = text.charAt(i);
        output.push(`&${hex}${char}`);
    }
    return output.join('');
}

