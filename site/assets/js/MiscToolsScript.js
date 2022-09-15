function calculateRam(){
    ram = document.getElementById("RamAmount").value;
    ram = 11*ram/12-1200
    // 11x/12-1200 where x is the amount of ram rounded up to the nearest 100
    let ramAmount = Math.ceil(ram / 100) * 100;
    return document.getElementById("RamOutputText").innerText = ramAmount;
}
calculateRam();
/* Copies contents to clipboard */
function copyTextToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard!');
    });
}

function decodeGradient(){
    let gradient = document.getElementById("GradientText").value;
    let type = document.getElementById("GradientType").value;
    let decoded;
    console.log(type)
    switch (type) {
        case "0":
            decoded = gradient.replace(/&#([A-Fa-f0-9]){6}/g, "");
            break;
        case "1":
            decoded = gradient.replace(/<#([A-Fa-f0-9]){6}>/g, "");
            break;
        case "2":
            decoded = gradient.replace(/&x&([A-Fa-f0-9])&([A-Fa-f0-9])&([A-Fa-f0-9])&([A-Fa-f0-9])&([A-Fa-f0-9])&([A-Fa-f0-9])/g, "");
            break;
        case "3":
            decoded = gradient.replace(/§x§([A-Fa-f0-9])§([A-Fa-f0-9])§([A-Fa-f0-9])§([A-Fa-f0-9])§([A-Fa-f0-9])§([A-Fa-f0-9])/g, "");
            break;
        default:
            break;
    }
    document.getElementById("DecodedOutput").value = decoded;
}