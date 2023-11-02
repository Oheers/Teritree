const auth = require('./auth-account.js')
const dbManager = require("./database.js")

const activeUsers = {}
const userLocations = {}
const activeChunks = {}

const maxSpeed = 0.002

function addPlayer(player, socketID) {
    activeUsers[socketID] = player;
}

function deletePlayer(socketID) {
    delete activeUsers[socketID];
}

// Processes the x, y, and colour variables and sends them to the database backend.
function onNewColour(x, y, colour) {
    const chunkID = ((157 - Math.ceil(y / 32)) * 312) + (Math.floor(x / 32) + 156);
    const tileID = (Math.abs(y) % 32) * 32 + (Math.abs(x) % 32);
    dbManager.sendTileUpdate(chunkID, tileID, getItemID(colour), Date.now());
}

function onMove(newX, newY, playerID) {
    if (!activeUsers.hasOwnProperty(playerID)) {
        return null;
    }

    const player = activeUsers[playerID];

    const timeDiff = Date.now() - player.lastMoveTime;
    if (timeDiff === 0) return null;
    if (Math.sqrt((newX - player.x)**2 + (newY - player.y)**2) / (Date.now() - player.lastMoveTime) > maxSpeed) {
        // Player moving illegally, returning the difference so that it can be reversed clientside in case it was due to
        // latency issue rather than hacked clients.
        return shouldRecalibrate(player);
    }
    player.lastMoveTime = Date.now();
    player.x = newX;
    player.y = newY;

    return shouldRecalibrate(player);
}

function shouldRecalibrate(player) {
    if (Date.now() - player.lastPositionRecalibration > 1000) {
        player.lastPositionRecalibration = Date.now();
        return {
            x: player.x,
            y: player.y
        };
    } else return null;
}

function getItemID(colour) {
    return itemMap.findIndex(function (item) {
        return item === colour;
    });
}

module.exports = {
    onNewColour, onMove, addPlayer, deletePlayer
}

// Items, the index of each item is the id of the item.
const itemMap = [
    "red", "#fecc02", "yellow", "lime", "green", "aqua", "#006aa7", "black",
    "gray", "white", "#cc00ff"
]