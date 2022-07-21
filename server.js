const ejs = require('ejs');
const path = require("path");
const Canvas = require('canvas');
const express = require('express');
const config = require('./config');
const GIFEncoder = require('gifencoder');
const bodyParser = require("body-parser");
const { existsSync } = require('fs');
const app = express();

const dataDir = path.resolve(`${process.cwd()}${path.sep}site`); // The absolute path of current this directory.
const templateDir = path.resolve(`${dataDir}${path.sep}templates`); // Absolute path of ./templates directory.

Canvas.registerFont("./site/assets/fonts/MinecraftBold.otf", {family: "MinecraftBold"});
Canvas.registerFont("./site/assets/fonts/MinecraftItalic.otf", {family: "MinecraftItalic"});
Canvas.registerFont("./site/assets/fonts/MinecraftRegular.otf", {family: "MinecraftRegular"});
Canvas.registerFont("./site/assets/fonts/MinecraftBoldItalic.otf", {family: "MinecraftBoldItalic"});


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

app.get('/:page', (req, res) => {
    if (!existsSync(`./site/templates/${req.params.page.toLowerCase()}.ejs`)) return renderTemplate(res, req, 'notfound.ejs');
    renderTemplate(res, req, `${req.params.page.toLowerCase()}.ejs`, {
        queryPreset: req.query.preset
    });
});

app.post('/api/render/gradient', (req, res) => {
    let preset = decodeGradient(req.body.preset);
    let preview = createPreview(preset.colors, preset.text, preset.formats);
    let output = createOutput(preset.colors, preset.text, preset.formats);
    res.status(200)
    res.json({
        Image: preview,
        Output: output
    })
});

app.post('/api/render/AnimTAB', (req, res) => {
    let preset = decodeAnimTAB(req.body.preset);
    let preview = createPreviewGIF(preset.colors, preset.text, preset.speed, preset.type, preset.formats);
    let output = createOutput(preset.colors, preset.text, preset.formats);
    res.status(200)
    res.json({
        Image: preview,
        Output: output
    })
});

app.listen(config.port, null, null);
console.log('Server started on port ' + config.port);

function fromBinary(encoded) {
    binary = atob(encoded)
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return String.fromCharCode(...new Uint16Array(bytes.buffer));
}

function decodeGradient(preset) {
    let string = fromBinary(preset)
    let data = string.split(':-:')
    let colors = data[0].split(',')
    let text = data[1]
    let formats = decompress(data[2], 4)
    return {colors, text, formats}
}

function decodeAnimTAB(preset) {
    let string = fromBinary(preset)
    let data = string.split(':-:')
    let colors = data[0].split(',')
    let text = data[1]
    let speed = data[2]
    let type = data[3]
    let formats = decompress(data[4], 4)
    return {colors, text, speed, type, formats}
}

// Takes a number and turns it into an array of boolean values
// Second parameter is how many values to parse out of the number
function decompress(input, expectedValues) {
    const values = [];
    for (let i = 0; i < expectedValues; i++) {
        const value = !!((input >> i) & 1);
        values.push(value);
    }
    return values;
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

class AnimatedGradient extends Gradient {
    constructor(colors, numSteps, offset) {
        super(colors, numSteps);
        this.step = offset;
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

const applyText = (canvas, text, formats) => {
    const context = canvas.getContext('2d');

    // Declare a base size of the font
    let fontSize = 70;

    let font = "MinecraftRegular"

    if (formats[0] === true){
        if(formats[1] === true){
            font = "MinecraftBoldItalic"
        }else{
            font = "MinecraftBold"
        }
    }else if(formats[1] === true){
        font = "MinecraftItalic"
    }

    do {
        // Assign the font to the context and decrement it so it can be measured again
        context.font = `${fontSize -= 1}px ${font}`;
        // Compare pixel width of the text to the canvas minus the approximate avatar size
        
    } while (context.measureText(text).width > canvas.width - 50);

    // Return the result to use in the actual canvas
    return context.font;
};

function texter(canvas, str, colors, x, y, formats){
    let ctx = canvas.getContext('2d');
    ctx.font = applyText(canvas, str, formats);
    for(var i = 0; i <= str.length; ++i){
        let hex = colors[i]
        var ch = str.charAt(i);
        ctx.fillStyle = '#' + hex
        ctx.fillText(ch, x, y);
        let {width} = ctx.measureText(ch);
        if(formats[2] === true) ctx.fillRect(x, y*1.05, width, width/6);
        if(formats[3] === true) ctx.fillRect(x, y/1.25, width, width/6);
        x += ctx.measureText(ch).width;
    }
}

function createPreview(colors, text, formats){
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
    texter(canvas, text, outputColors, 10, 60, formats);
    return canvas.toDataURL();
}

function createPreviewGIF(colors, text, speed, type, formats){
    const encoder = new GIFEncoder(700, 250);
    encoder.setRepeat(0);
    encoder.setDelay(speed);
    encoder.setQuality(50)
    encoder.setTransparent();
    encoder.start();

    let newColors = []
    for(var i = 0; i < colors.length; ++i){
        newColors.push(convertToRGB(colors[i]))
    }
    const canvas = Canvas.createCanvas(700, 250);
    const ctx = canvas.getContext('2d');
    ctx.fillRect()
    let length = text.length * 2 - 2
    for (let n = length; n > 0; n--){
        // ctx.fillStyle = "#3A3A3A";
        // ctx.fillRect(0, 0, 0, canvas.width);
        let gradient = new AnimatedGradient(newColors, text.length, n);
        let outputColors = [];
        for (let i = 0; i < text.length; i++) {
            let hex = convertToHex(gradient.next());
            outputColors.push(hex);
        }
        texter(canvas, text, outputColors, 10, 60, formats);
        encoder.addFrame(ctx);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    encoder.finish();
    return encoder.out.getData();
}

function createOutput(colors, text, formats){
    let newColors = []
    for(var i = 0; i < colors.length; ++i){
        newColors.push(convertToRGB(colors[i]))
    }
    let gradient = new Gradient(newColors, text.replace(/ /g, '').length);
    let output = [];
    for (let i = 0; i < text.length; i++) {
        let format = ""
        if (formats[0]) format += '&l';
        if (formats[1]) format += '&o';
        if (formats[2]) format += '&n';
        if (formats[3]) format += '&m';
        let hex = convertToHex(gradient.next());
        let char = text.charAt(i);
        output.push(`${format}&${hex}${char}`);
    }
    return output.join('');
}