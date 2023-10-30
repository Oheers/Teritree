const auth = require('./auth-account.js')
const dbManager = require("./database.js")

// Processes the x, y, and colour variables and sends them to the database backend.
function onNewColour(x, y, colour) {
    const chunkID = ((157 - Math.ceil(y / 32)) * 312) + (Math.floor(x / 32) + 156);
    const tileID = (Math.abs(y) % 32) * 32 + (Math.abs(x) % 32);
    dbManager.sendTileUpdate(chunkID, tileID, getItemID(colour), Date.now());
}

function getItemID(colour) {
    return itemMap.findIndex(function (item) {
        return item === colour;
    });
}

module.exports = {
    onNewColour
}

// Items, the index of each item is the id of the item.
const itemMap = [
    "red", "#fecc02", "yellow", "lime", "green", "aqua", "#006aa7", "black",
    "gray", "white", "#cc00ff"
]