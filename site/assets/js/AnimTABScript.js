// elements for obtaining vals
const animationName = document.getElementById('animationName');
const animationText = document.getElementById('text');
const animationTypes = document.getElementById('animationType');
const animationFormatting = document.getElementById('animationFormatting');
const animation = document.getElementById('animation');

const savedColors = [];
const formats = {
    0: {
        outputPrefix: '',
        template: '&#$1$2$3$4$5$6$f$c',
        formatChar: '&',
    },
    1: {
        outputPrefix: '',
        template: '&x&$1&$2&$3&$4&$5&$6$f$c',
        formatChar: '&',
    },
    2: {
        outputPrefix: '',
        custom: true,
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
    } else {
        // Otherwise randomize them instead
        savedColors.push('00FFE0');
        savedColors.push('EB00FF');
        for (let i = 0; i < 8; i++) savedColors.push(getRandomHexColor());
        updateCookies();
    }
}

function updateCookies() {
    for (let i = 1; i <= savedColors.length; i++) Cookies.set(`color-${i}`, savedColors[i - 1], {
        expires: 7,
        path: '/AnimTab'
    });
    Cookies.set('activeColors', activeColors, {expires: 7, path: '/AnimTab'});
    Cookies.set('text', animationText.value, {expires: 7, path: '/AnimTab'});
    Cookies.set('animationSpeed', speed.value, {expires: 7, path: '/AnimTab'});
    Cookies.set('bold', boldElement.checked, {expires: 7, path: '/AnimTab'});
    Cookies.set('italics', italicElement.checked, {expires: 7, path: '/AnimTab'});
    Cookies.set('underline', underlineElement.checked, {expires: 7, path: '/AnimTab'});
    Cookies.set('strike', strikeElement.checked, {expires: 7, path: '/AnimTab'});
}

class AnimatedGradient extends Gradient {
    constructor(colors, numSteps, offset) {
        super(colors, numSteps);
        this.step = offset;
    }
}

const customFormatWrapper = document.getElementById('customFormatWrapper');
const customFormat = document.getElementById('customFormat');

function updateOutputText() {
    updateCookies();
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
                let hexOutput = format.custom ? customFormat.value : format.template;
                for (let n = 1; n <= 6; n++) hexOutput = hexOutput.replace(`$${n}`, hex.charAt(n - 1));
                let formatCodes = '';
                if (bold) formatCodes += format.formatChar + 'l';
                if (italic) formatCodes += format.formatChar + 'o';
                if (underline) formatCodes += format.formatChar + 'n';
                if (strike) formatCodes += format.formatChar + 'm';
                if (!format.custom) hexOutput = hexOutput.replace('$f', formatCodes);
                output += hexOutput.replace('$c', char);
            }
            outputArray.push(`  - "${output}"`);
        }
        finalOutput = outputArray.reverse();
    } else if (animationTypes.value == '1') {
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
                let hexOutput = format.custom ? customFormat.value : format.template;
                for (let n = 1; n <= 6; n++) hexOutput = hexOutput.replace(`$${n}`, hex.charAt(n - 1));
                let formatCodes = '';
                if (bold) formatCodes += format.formatChar + 'l';
                if (italic) formatCodes += format.formatChar + 'o';
                if (underline) formatCodes += format.formatChar + 'n';
                if (strike) formatCodes += format.formatChar + 'm';
                if (!format.custom) hexOutput = hexOutput.replace('$f', formatCodes);
                output += hexOutput.replace('$c', char);
            }
            outputArray.push(`  - "${output}"`);
        }
        finalOutput = outputArray;
    } else if (animationTypes.value == '2') {
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
                let hexOutput = format.custom ? customFormat.value : format.template;
                for (let n = 1; n <= 6; n++) hexOutput = hexOutput.replace(`$${n}`, hex.charAt(n - 1));
                let formatCodes = '';
                if (bold) formatCodes += format.formatChar + 'l';
                if (italic) formatCodes += format.formatChar + 'o';
                if (underline) formatCodes += format.formatChar + 'n';
                if (strike) formatCodes += format.formatChar + 'm';
                if (!format.custom) hexOutput = hexOutput.replace('$f', formatCodes);
                output += hexOutput.replace('$c', char);
            }

            output1.push(`  - "${output}"`);
            output2.push(`  - "${output}"`);
        }
        finalOutput = output1.reverse().concat(output2);
    } else if (animationTypes.value == '3') {
        for (let n = 0; n < newNick.length * 2 - 2; n++) {
            const colors = [];
            const gradient = new AnimatedGradient(getColors(), newNick.length, n);
            let output = format.outputPrefix;

            const hex = convertToHex(gradient.next());
            colors.push(hex);
            let hexOutput = format.custom ? customFormat.value : format.template;
            for (let n = 1; n <= 6; n++) hexOutput = hexOutput.replace(`$${n}`, hex.charAt(n - 1));
            let formatCodes = '';
            if (bold) formatCodes += format.formatChar + 'l';
            if (italic) formatCodes += format.formatChar + 'o';
            if (underline) formatCodes += format.formatChar + 'n';
            if (strike) formatCodes += format.formatChar + 'm';
            if (!format.custom) hexOutput = hexOutput.replace('$f', formatCodes);
            output += hexOutput;
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
        } else if (animationTypes.value == '1') {
            const gradient = new AnimatedGradient(getColors(), newNick.length * 2, step++);
            for (let i = 0; i < newNick.length * 2; i++) {
                if (newNick.charAt(i) != ' ') colors.push(convertToHex(gradient.next()));
            }
            displayColoredName(newNick, colors, false);
        } else if (animationTypes.value == '2') {
            const gradient = new AnimatedGradient(getColors(), newNick.length, step++);
            for (let i = 0; i < newNick.length; i++) {
                if (newNick.charAt(i) != ' ') colors.push(convertToHex(gradient.next()));
            }
            displayColoredName("Pls fix i have no idea anymore", colors, false);
        } else if (animationTypes.value == '3') {
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
    } else if (italicElement.checked) {
        animation.classList.add('minecraftitalic');
    }
    animation.innerHTML = '';
    let colorIndex = 0;
    if (fulltext) {
        const animationSpan = document.createElement('span');
        if (underlineElement.checked) {
            if (strikeElement.checked) animationSpan.classList.add('minecraftustrike');
            else animationSpan.classList.add('minecraftunderline');
        } else if (strikeElement.checked) {
            animationSpan.classList.add('minecraftstrike');
        }

        animationSpan.style.color = `#${colors[colorIndex]}`;
        animationSpan.textContent = nickName;
        animation.append(animationSpan);
    } else {
        for (let i = 0; i < nickName.length; i++) {
            const animationSpan = document.createElement('span');
            if (underlineElement.checked) {
                if (strikeElement.checked) animationSpan.classList.add('minecraftustrike');
                else animationSpan.classList.add('minecraftunderline');
            } else if (strikeElement.checked) {
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

function importPreset(p) {
    let preset = fromBinary(p);
    try {
        preset = JSON.parse(preset);
    } catch (e) {
        alert("Invalid preset!");
        return;
    }
    const colors = preset.colors;
    animationText.value = preset.text;
    speed.value = preset.speed;
    animationTypes.value = preset.type;
    const formats = decompress(preset.formats, 4);
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
    } catch (error) {
        alert("Invalid Preset");
    }
}

loadCookies();

toggleColors(activeColors);
updateOutputText();