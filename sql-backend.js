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
            event.emitter.emit("afk_player", user)
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
    pendingAuth[tokenID] = {
        id: id,
        username: username
    }
}

function verifyAuthUser(tokenID, socketID, x, y) {
    if (pendingAuth.hasOwnProperty(tokenID)) {
        const userID = pendingAuth[tokenID].id;
        const playerObject = new Player(userID, 527, x, y, 10000, 2, pendingAuth[tokenID].username, 1, 1);
        addPlayer(playerObject, socketID)
        return playerObject;
    } else {
        return undefined;
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
                // @todo add x and y to this return.
                resolve({auth: true, token: r[0][0].token});
            }
        });
    })
}

async function selectPlayer(authToken) {
    return new Promise((resolve) => {
        dbManager.getAccountFromAuthToken(authToken).then(r => {
            if (r[0][0] === undefined) {
                resolve({auth: false});
            } else {
                // @todo add x and y to this return.
                resolve({auth: true})
            }
        })
    })
}

async function fetchAccount(authToken) {
    return new Promise((resolve) => {
        dbManager.getAccountFromAuthToken(authToken).then(r => {
            if (r[0][0] === undefined) {
                resolve({auth: false});
            } else {
                addPendingAuthUser(authToken, r[0][0].id, r[0][0].username)
                resolve({auth: true, username: r[0][0].username, accountID: r[0][0].id})
            }
        })
    })
}

// Checks if the user is only logged in one location, kicking the old user if they are.
function checkPlayerAlreadyLoggedIn(accountID) {
    Object.entries(activeUsers).forEach(user => {
        if (user[1].accountID === accountID) {
            event.emitter.emit("user_already_logged_in", user[0])
        }
    })
}

module.exports = {
    onNewColour, onMove, addPlayer, deletePlayer, getCoords, getPlayers, getPlayer, kickAFKPlayers, createAccount, signin,
    fetchAccount, verifyAuthUser, checkPlayerAlreadyLoggedIn, selectPlayer
}