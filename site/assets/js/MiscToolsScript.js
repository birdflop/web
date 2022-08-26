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