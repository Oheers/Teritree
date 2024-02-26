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