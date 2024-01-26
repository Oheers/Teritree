// If currentItem = -1, the player is holding nothing.
let itemID = -1;

function setItemID(itemID) {
    this.itemID = itemID;
}

function increaseItemID() {
    // length - 1 to prevent selector being chosen.
    if (itemID + 1 < Object.keys(sprites).length - 1) {
        itemID += 1;
    }
    changeHotbar()
}

function decreaseItemID() {
    if (itemID - 1 >= 0) {
        itemID--;
    }
    changeHotbar()
}

let hotbarDisappearTimeout = undefined;

function changeHotbar() {
    if (hotbarDisappearTimeout != undefined) {
        clearTimeout(hotbarDisappearTimeout);
        hotbarDisappearTimeout = undefined;
    }
    const hotbar = document.getElementById("colour-indicator-outline");
    const hotbarName = document.getElementById("colour-name");
    hotbarName.style.opacity = 1;
    hotbarName.innerHTML = sprites[itemID].name_en
    hotbarDisappearTimeout = setTimeout(() => {
        hotbarName.style.opacity = 0;
    }, 5000);
    const coords = getImageCoords(itemID);
    hotbar.style.backgroundPosition = `calc((5vw - 16px) * ${coords.sx / -16}) calc((5vw - 16px) * ${coords.sy / -16})`;
}