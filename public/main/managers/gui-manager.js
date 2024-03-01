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