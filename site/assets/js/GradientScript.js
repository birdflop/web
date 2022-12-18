// elements for obtaining vals
const nickName = document.getElementById('text');
const coloredNick = document.getElementById('coloredNick');
const outputText = document.getElementById('outputText');

const savedColors = [];
const toggled = false;
const formats = {
    0: {
        outputPrefix: '',
        template: '&#$1$2$3$4$5$6$f$c',
        formatChar: '&',
        maxLength: 256,
    },
    1: {
        outputPrefix: '',
        template: '<#$1$2$3$4$5$6>$f$c',
        formatChar: '&',
        maxLength: 256,
    },
    2: {
        outputPrefix: '',
        template: '&x&$1&$2&$3&$4&$5&$6$f$c',
        formatChar: '&',
        maxLength: 256,
    },
    3: {
        outputPrefix: '/nick ',
        template: '&#$1$2$3$4$5$6$f$c',
        formatChar: '&',
        maxLength: 256,
    },
    4: {
        outputPrefix: '/nick ',
        template: '<#$1$2$3$4$5$6>$f$c',
        formatChar: '&',
        maxLength: 256,
    },
    5: {
        outputPrefix: '/nick ',
        template: '&x&$1&$2&$3&$4&$5&$6$f$c',
        formatChar: '&',
        maxLength: 256,
    },
    6: {
        outputPrefix: '',
        template: '§x§$1§$2§$3§$4§$5§$6$f$c',
        formatChar: '§',
    },
    7: {
        outputPrefix: '',
        template: '[COLOR=#$1$2$3$4$5$6]$c[/COLOR]',
    },
    8: {
        outputPrefix: '',
        template: 'MiniMessage: <gradient:#hex:#hex><bold>',
    },
    9: {
        custom: true,
    },
};

let activeColors = 2;

function loadCookies() {
    // Apply cookies if set
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

        const nickname = Cookies.get('nickname');
        if (nickname) nickName.value = nickname;

        if (Cookies.get('bold') === 'true') boldElement.checked = true;
        if (Cookies.get('italics') === 'true') italicElement.checked = true;
        if (Cookies.get('underline') === 'true') underlineElement.checked = true;
        if (Cookies.get('strike') === 'true') strikeElement.checked = true;
        if (Cookies.get('output-format')) outputFormat.value = Cookies.get('output-format');
        if (Cookies.get('custom-format')) customFormatElement.value = Cookies.get('custom-format');
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
        path: '/Gradients'
    });
    Cookies.set('activeColors', activeColors, {expires: 7, path: '/Gradients'});
    Cookies.set('nickname', nickName.value, {expires: 7, path: '/Gradients'});
    Cookies.set('bold', boldElement.checked, {expires: 7, path: '/Gradients'});
    Cookies.set('italics', italicElement.checked, {expires: 7, path: '/Gradients'});
    Cookies.set('underline', underlineElement.checked, {expires: 7, path: '/Gradients'});
    Cookies.set('strike', strikeElement.checked, {expires: 7, path: '/Gradients'});
    Cookies.set('output-format', outputFormat.value, {expires: 7, path: '/Gradients'});
    Cookies.set('custom-format', customFormatElement.value, {expires: 7, path: '/Gradients'});
}

const customFormatWrapper = document.getElementById('customFormatWrapper');
const customFormat = document.getElementById('customFormat');
const formatSelector = document.getElementById('formatSelector');

function updateOutputText(event) {
    const format = formats[outputFormat.value];

    if (format.custom) customFormatWrapper.classList.remove('hidden');
    else customFormatWrapper.classList.add('hidden');

    if (format.outputPrefix) {
        nickName.value = nickName.value.replace(/ /g, '');
        if (nickName.value) {
            const letters = /^[0-9a-zA-Z_]+$/;
            if (!nickName.value.match(letters)) nickName.value = nickName.value.replace(event.data, '');
            if (!nickName.value.match(letters)) nickName.value = 'SimplyMC';
        }
    }

    let newNick = nickName.value;
    if (!newNick) newNick = 'Type something!';

    const bold = boldElement.checked;
    const italic = italicElement.checked;
    const underline = underlineElement.checked;
    const strike = strikeElement.checked;

    updateCookies();

    // Ovwrite the default function with this one
    if (outputFormat.value === '8') {
        let output = format.outputPrefix || '';
        output += `<gradient:` + getColors().map(value => `${convertToHex(value)}`).join(`:`) + `>`;

        if (bold) output += `<b>`;
        if (italic) output += `<i>`;
        if (underline) output += `<u>`;
        if (strike) output += `<st>`;

        output += newNick;
        outputText.innerText = output;
        showError(format.maxLength && format.maxLength < output.length);
        return;
    }

    const gradient = new Gradient(getColors(), newNick.replace(/ /g, '').length);
    const charColors = [];
    let output = format.outputPrefix || "";
    for (let i = 0; i < newNick.length; i++) {
        const char = newNick.charAt(i);
        if (char == ' ') {
            output += char;
            charColors.push(null);
            continue;
        }

        const hex = convertToHex(gradient.next());
        charColors.push(hex);
        let hexOutput = format.custom ? customFormat.value : format.template;
        for (let n = 1; n <= 6; n++) hexOutput = hexOutput.replace(`$${n}`, hex.charAt(n - 1));
        let formatCodes = '';
        if (format.formatChar) {
            formatSelector.classList.remove('hidden');
            if (bold) formatCodes += format.formatChar + 'l';
            if (italic) formatCodes += format.formatChar + 'o';
            if (underline) formatCodes += format.formatChar + 'n';
            if (strike) formatCodes += format.formatChar + 'm';
        } else {
            formatSelector.classList.add('hidden');
        }

        if (!format.custom) hexOutput = hexOutput.replace('$f', formatCodes);

        hexOutput = hexOutput.replace('$c', char);
        output += hexOutput;
    }

    outputText.innerText = output;
    showError(format.maxLength && format.maxLength < output.length);
    displayColoredName(newNick, charColors, format.formatChar);
}

function displayColoredName(nickName, colors, format) {
    coloredNick.classList.remove('minecraftbold', 'minecraftibold', 'minecraftitalic');

    if (format) {
        if (boldElement.checked) {
            if (italicElement.checked) coloredNick.classList.add('minecraftibold');
            else coloredNick.classList.add('minecraftbold');
        } else if (italicElement.checked) {
            coloredNick.classList.add('minecraftitalic');
        }
    }

    coloredNick.innerHTML = '';
    for (let i = 0; i < nickName.length; i++) {
        const coloredNickSpan = document.createElement('span');
        if (underlineElement.checked) {
            if (strikeElement.checked) coloredNickSpan.classList.add('minecraftustrike');
            else coloredNickSpan.classList.add('minecraftunderline');
        } else if (strikeElement.checked) {
            coloredNickSpan.classList.add('minecraftstrike');
        }
        coloredNickSpan.style.color = `#${colors[i]}`;
        coloredNickSpan.textContent = nickName[i];
        coloredNick.append(coloredNickSpan);
    }
}

const numOfColors = document.getElementById("numOfColors");

function preset(n) {
    const colors = presets[n].colors;
    const container = $('#hexColors');
    container.empty();
    // Need to add some colors
    const template = $('#hexColorTemplate').html();
    for (let i = 0 + 1; i <= colors.length; i++) {
        const html = template.replace(/\$NUM/g, i).replace(/\$VAL/g, colors[i - 1]);
        container.append(html);
    }
    nickName.value = presets[n].text;
    numOfColors.value = colors.length;
    // Refresh all jscolor elements
    jscolor.install();
}

loadCookies();

toggleColors(activeColors);
updateOutputText();
