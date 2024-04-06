const auth = require('./auth-account.js')
const dbManager = require("./database.js")
const utils = require("./utils.js");
const event = require("./event-manager.js");
const { changeInternalCache, onTileChange} = require("./world-handler");
const { Player } = require("./objects/player");
const { Town } = require("./objects/town");
const { Claim } = require("./objects/claim");

const activeUsers = {};
const pendingAuth = {};

const sessionPlayers = {};

const maxSpeed = 0.25;
const afk_timer = 300000;

const players = {};
const towns = {};
const claims = {};

let leaderboard = [];

// Sorts the leaderboard from most to least trees
function reloadLeaderboard() {
    leaderboard.sort(function(a, b) { return b.trees - a.trees; })
}

getAllPlayers().then(r => {
    console.log("Players:", Object.keys(players).length)
    getAllTowns().then(r => {
        console.log("Towns:", Object.keys(towns).length)
        getAllClaims().then(r => {
            console.log("Claims:", Object.keys(claims).length);
        })
    });
})

async function addPlayer(player, socketID) {
    activeUsers[socketID] = player;
    sessionPlayers[player.accountID] ??= player
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

function writePlayer(socketID) {
    const player = sessionPlayers[activeUsers[socketID].accountID];
    dbManager.updatePlayerRecord(player.accountID, player.x, player.y, player.itemID, player.townID)
}

function writePlayerWithObject(player) {
    dbManager.updatePlayerRecord(player.accountID, player.x, player.y, player.itemID, player.townID)
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
function onNewColour(x, y, colourID, oldColour, senderID) {
    const player = activeUsers[senderID];
    if (oldColour === undefined) oldColour = -1;
    sessionPlayers[player.accountID].itemID = oldColour;
    activeUsers[senderID].itemID = oldColour;
    const chunkID = utils.getChunkID(Math.floor(x / 32),  Math.ceil(-y / 32));
    if (claims[chunkID] !== undefined) {
        const playerTown = activeUsers[senderID].townID;
        if (playerTown !== claims[chunkID].townID) {
            return;
        }

        // The itemID corresponds to a tree.
        if (playerTown !== -1) {
            // A new tree is being placed
            if ((colourID >= 0 && colourID <= 22) || (colourID >= 28 && colourID <= 31) || (colourID >= 117 && colourID <= 119)) {
                towns[playerTown].trees += 1;
            // A tree is being removed
            } else if (colourID === -1 && ((oldColour >= 0 && oldColour <= 22) || (oldColour >= 28 && oldColour <= 31) || (oldColour >= 117 && oldColour <= 119))) {
                towns[playerTown].trees -= 1;
            }
            dbManager.updateTownTrees(playerTown, towns[playerTown].trees);
            reloadLeaderboard()
            if (leaderboard.length < 6 || towns[playerTown].trees > leaderboard[4].trees) {
                for (const [key, value] of Object.entries(activeUsers)) {
                    event.emitter.emit("update_leaderboard", key, getRelevantLeaderboard(value.accountID, value.townID !== -1))
                }
            } else {
                event.emitter.emit("update_leaderboard", senderID, getRelevantLeaderboard(player.accountID, player.townID !== -1));
            }
        }
    }
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
    sessionPlayers[player.accountID].x = newX;
    sessionPlayers[player.accountID].y = newY;
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

function addPendingAuthUser(tokenID, id, username, x, y, itemID, townID) {
    if (sessionPlayers[id] !== undefined) {
        x = sessionPlayers[id].x;
        y = sessionPlayers[id].y;
        itemID = sessionPlayers[id].itemID;
    }

    pendingAuth[tokenID] = {
        id: id,
        username: username,
        x: x,
        y: y,
        itemID: itemID,
        townID: townID
    }
}

function verifyAuthUser(tokenID, socketID) {
    if (pendingAuth.hasOwnProperty(tokenID)) {
        const userID = pendingAuth[tokenID].id;
        const playerObject = new Player(userID, socketID, pendingAuth[tokenID].townID, pendingAuth[tokenID].x, pendingAuth[tokenID].y, 10000, 2, pendingAuth[tokenID].username, 1, 1, pendingAuth[tokenID].itemID);
        addPlayer(playerObject, socketID)
        delete pendingAuth[tokenID];
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
                dbManager.newAccount(username, password, authToken, 0, 0)
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
                resolve({auth: true, token: r[0][0].token, x: r[0][0].x, y: r[0][0].y});
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
                addPendingAuthUser(authToken, r[0][0].id, r[0][0].username, r[0][0].x, r[0][0].y, r[0][0].itemID, r[0][0].townID)
                resolve({auth: true, username: r[0][0].username, accountID: r[0][0].id, x: r[0][0].x, y: r[0][0].y})
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

// Fetches whether a town exists, returns undefined if no town exists.
function getTown(townName) {
    return new Promise((resolve) => {
        dbManager.getTownFromName(townName).then(r => {
            if (r[0][0] === undefined) {
                resolve(undefined);
                return;
            }
            const town = r[0][0];
            resolve(new Town(town.townID, players[town.leaderID], town.spawnX, town.spawnY, town.name, town.colourID, town.description,
                town.invite_only, town.invite_code, town.trees));
        })
    })
}

function getTownFromID(id) {
    return towns[id];
}

function getAllPlayers() {
    return new Promise((resolve => {
        dbManager.getAllPlayers().then(r => {
            if (r[0] === undefined) return;
            r[0].forEach(player => {
                players[player.id] = new Player(player.id, player.townID, player.x, player.y, player.joinEpoch, player.competitionsWon,
                    player.username, player.townRank, player.serverRank, player.itemID);
            })
            resolve();
        })
    }))
}

function getAllTowns() {
    return new Promise((resolve => {
        dbManager.getAllTowns().then(r => {
            if (r[0] === undefined) return;
            r[0].forEach(town => {
                towns[town.townID] = new Town(town.townID, players[town.leaderID], town.spawnX, town.spawnY, town.name, town.colourID, town.description,
                    town.invite_only, town.invite_code, town.trees);
            })
            leaderboard = Object.values(towns);
            reloadLeaderboard();
            resolve();
        })
    }))
}

function createTown(player, townName, spawnX, spawnY, townDescription, townInviteOnly, townInviteCode, townColour) {
    return new Promise((resolve) => { dbManager.createTown(player.accountID, townName, spawnX, spawnY,
        townDescription, townInviteOnly, townInviteCode, townColour).then(r => {
            getTown(townName).then(r => {
                const town = new Town(r.townID, player, r.spawnX, r.spawnY, r.name, r.colourID, r.description, r.invite_only, r.invite_code, r.trees);;
                towns[r.townID] = town;
                leaderboard.push(town);
                player.townID = r.townID;
                sessionPlayers[player.accountID].townID = r.townID;
                writePlayerWithObject(player);
                event.emitter.emit("new_town", player.socketID, r.name, r.spawnX, r.spawnY, r.townID);
                event.emitter.emit("update_leaderboard", player.socketID, getRelevantLeaderboard(player.accountID, player.townID !== -1))
                resolve(r);
            })
        })
    });
}

function createClaim(chunkID, townID, isPublic) {
    const claimObject = new Claim(chunkID, townID, isPublic);
    towns[townID].addClaim(chunkID, claimObject);
    claims[chunkID] = claimObject;
    return new Promise((resolve => {
        dbManager.createClaim(chunkID, townID, isPublic).then(r => {
            resolve();
        })
    }))
}

function getClaim(chunkID) {
    return claims[chunkID];
}

function getAllClaims() {
    return new Promise((resolve => {
        dbManager.getAllClaims().then(r => {
            if (r[0] === undefined) return;
            r[0].forEach(claim => {
                claims[claim.chunkID] = new Claim(claim.chunkID, claim.townID, claim.isPublic);
            })
            resolve();
        })
    }))
}

function getRelevantLeaderboard(accountID, inTown) {
    let foundTown = false;
    let data = [];
    // Looping through the top five towns.
    for (let i=0; i < 5; i++) {
        if (i + 1 > leaderboard.length) break;
        const town = leaderboard[i];
        if (town.leader.accountID === accountID) foundTown = true;
        // p = position, n = name, t = tree count
        data[i] = {
            p: i + 1,
            n: town.name,
            t: town.trees,
            c: town.colourID
        }
    }
    // Adding the user's own town if the game couldn't find their town in the top 5.
    if (!foundTown && inTown) {
        for (let i=5; i < leaderboard.length; i++) {
            const town = leaderboard[i];
            if (town.leader.accountID === accountID) {
                data[5] = {
                    p: i + 1,
                    n: town.name,
                    t: town.trees,
                    c: town.colourID
                }
            }

        }
    }
    return data;
}

module.exports = {
    onNewColour, onMove, addPlayer, deletePlayer, getCoords, getPlayers, getPlayer, kickAFKPlayers, createAccount, signin,
    fetchAccount, verifyAuthUser, checkPlayerAlreadyLoggedIn, selectPlayer, writePlayer, getTown, createTown, createClaim,
    getClaim, getTownFromID, getRelevantLeaderboard
}