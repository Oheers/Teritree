const auth = require('./auth-account.js')
const dbManager = require("./database.js")
const utils = require("./utils.js");
const event = require("./event-manager.js");
const { changeInternalCache, onTileChange} = require("./world-handler");

const activeUsers = {}
const userLocations = {}
const activeChunks = {}

const maxSpeed = 0.0025

function addPlayer(player, socketID) {
    activeUsers[socketID] = player;
}

function getPlayer(playerID) {
    return activeUsers[playerID]
}

function getPlayers() {
    const returningPlayers = {};
    for (const socketID in activeUsers) {
        const player = activeUsers[socketID];
        returningPlayers[socketID] = {
            x: player.x,
            y: -player.y,
            displayName: player.displayName,
            id: socketID
        }
    }
    return returningPlayers;
}

function getCoords(socketID) {
    const user = activeUsers[socketID];
    return {
        x: user.x,
        y: user.y
    }
}

function deletePlayer(socketID) {
    delete activeUsers[socketID];
}

// Processes the x, y, and colour variables and sends them to the database backend.
function onNewColour(x, y, colourID) {
    const chunkID = utils.getChunkID(Math.floor(x / 32),  Math.ceil(-y / 32));
    const tileID = utils.getTileID(x, y);
    console.log("new colour notif:", tileID, chunkID, x, y, colourID)
    onTileChange(chunkID, tileID, colourID);
    //dbManager.sendTileUpdate(chunkID, tileID, colourID, Date.now());
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

    const newRenderRegion = utils.findRenderRegion(newX, newY);
    const oldRenderRegion = utils.findRenderRegion(player.x, player.y);
    if (newRenderRegion !== oldRenderRegion) {
        changeInternalCache(newRenderRegion, oldRenderRegion, playerID)
    }
    player.lastMoveTime = Date.now();
    event.emitter.emit("player_move", playerID, newX - player.x, player.y - newY)
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
    onNewColour, onMove, addPlayer, deletePlayer, getCoords, getPlayers, getPlayer
}

// Items, the index of each item is the id of the item.
const itemMap = [
    "red", "#fecc02", "yellow", "lime", "green", "aqua", "#006aa7", "black",
    "gray", "white", "#cc00ff"
]