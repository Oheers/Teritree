const auth = require('./auth-account.js')
const dbManager = require("./database.js")
const utils = require("./utils.js");
const event = require("./event-manager.js");
const { changeInternalCache, onTileChange} = require("./world-handler");
const {Player} = require("./objects/player");

const activeUsers = {}
const pendingAuth = {}
const userLocations = {}
const activeChunks = {}

const maxSpeed = 0.25;
const afk_timer = 300000;

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
    if (user === undefined) return undefined;
    return {
        x: user.x,
        y: user.y
    }
}

function deletePlayer(socketID) {
    if (activeUsers.hasOwnProperty(socketID)) {
        delete activeUsers[socketID];
    }
}

// Processes the x, y, and colour variables and sends them to the database backend.
function onNewColour(x, y, colourID, senderID) {
    activeUsers[senderID].setActive();
    const chunkID = utils.getChunkID(Math.floor(x / 32),  Math.ceil(-y / 32));
    const tileID = utils.getTileID(x, y);
    onTileChange(chunkID, tileID, colourID, senderID);
}

function onMove(newX, newY, playerID) {
    if (!activeUsers.hasOwnProperty(playerID)) {
        return null;
    }

    const player = activeUsers[playerID];
    player.setActive();

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

function kickAFKPlayers() {
    for (const user in activeUsers) {
        if (isPlayerAFK(activeUsers[user])) {
            event.emitter.emit("afk_player", activeUsers[user].displayName)
            // @TODO DISCONNECT USER FROM SOCKET.IO SERVER
        }
    }
}

function isPlayerAFK(player) {
    return Date.now() - player._lastActiveTime >= afk_timer;
}

function getItemID(colour) {
    return itemMap.findIndex(function (item) {
        return item === colour;
    });
}

function addPendingAuthUser(tokenID, id, username) {
    console.log("new pending auth user:", tokenID)
    pendingAuth[tokenID] = {
        id: id,
        username: username
    }
}

function verifyAuthUser(tokenID, socketID, x, y) {
    console.log("auth token:", tokenID, "successfully verified.");
    if (pendingAuth.hasOwnProperty(tokenID)) {
        const playerObject = new Player(socketID, 527, x, y, 10000, 2, pendingAuth[tokenID].username, 1, 1);
        addPlayer(playerObject, socketID)
        console.log("players:", activeUsers)
    }
}

async function createAccount(username, password, authToken) {
    return new Promise((resolve) => {
        dbManager.getAccount(username).then(r => {
            if (r[0][0] !== undefined) {
                resolve(false);
            } else {
                dbManager.newAccount(username, password, authToken)
                    .then(result => {  resolve(true); })
            }
        });
    })
}

async function signin(username, password) {
    return new Promise((resolve) => {
        dbManager.getAccount(username).then(r => {
            if (r[0][0] === undefined) {
                resolve({auth: false});
            } else if (password !== r[0][0].password) {
                resolve({auth: false});
            } else {
                resolve({auth: true, token: r[0][0].token});
            }
        });
    })
}

async function fetchAccount(authToken) {
    return new Promise((resolve) => {
        dbManager.getAccountFromAuthToken(authToken).then(r => {
            if (authToken === "experian-auth") {
                addPendingAuthUser(authToken, 52600, "Experian Account")
                resolve({auth: true, username: "Experian Account"})
            } else if (r[0][0] === undefined) {
                resolve({auth: false});
            } else {
                addPendingAuthUser(authToken, r[0][0].id, r[0][0].username)
                resolve({auth: true, username: r[0][0].username, accountID: r[0][0].id})
            }
        })
    })
}

module.exports = {
    onNewColour, onMove, addPlayer, deletePlayer, getCoords, getPlayers, getPlayer, kickAFKPlayers, createAccount, signin,
    fetchAccount, verifyAuthUser
}

// Items, the index of each item is the id of the item.
const itemMap = [
    "red", "#fecc02", "yellow", "lime", "green", "aqua", "#006aa7", "black",
    "gray", "white", "#cc00ff"
]