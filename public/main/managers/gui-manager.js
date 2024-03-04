function openTownMaker() {
    document.getElementById("town-creator").style.display = "block";
    document.getElementById("town-creator-outline").style.display = "block";

    const uiElements = document.querySelectorAll('.ui');

    uiElements.forEach(element => {
        element.style.display = 'none';
    });

    movementLock = true;
}

function hideTownMaker() {
    document.getElementById("town-creator").style.display = "none";
    document.getElementById("town-creator-outline").style.display = "none";

    const uiElements = document.querySelectorAll('.ui');

    uiElements.forEach(element => {
        element.style.display = 'block';
    });

    movementLock = false;
}

function generateRandomCode() {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-';

    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }

    return result;
}

function loadAbstractWorld() {
    for (let x = 1; x < 13; x++) {
        for (let y = 0; y < 12; y++) {
            document.getElementById(`colour-region-${(y * 12) + x}`).style.backgroundColor = standardColourRendering((x - 6) * 40, (y - 6) * 40);
        }
    }
}

function previewRegion(region) {
    if (selectedRegion !== -1) region = selectedRegion;
    if (region === 0) document.getElementById("live-location-selector").innerHTML = `Currently selected: Random`
    else {
        const x = Math.round((((region - 1) % 6) - 3) * 1664);
        const y = -Math.round((Math.floor((region - 1) / 6) - 3) * 1664);
        document.getElementById("live-location-selector").innerHTML = `Currently selected: (${x}, ${y}) to (${x + 1664}, ${y - 1664})`
    }
}

let selectedRegion = -1;

function selectRegion(region) {
    if (selectedRegion !== -1) document.getElementById(`location-tile${selectedRegion}`).style.outline = "none";
    document.getElementById(`location-tile${region}`).style.outline = "4px solid gold";
    selectedRegion = region;
    previewRegion(region);
}