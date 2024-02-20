const { Server } = require("socket.io");
const { Player } = require("./objects/player");
const dbBackend = require("./sql-backend");
const event = require("./event-manager.js");
let io;

const playerLinks = {};

event.emitter.on("chunk_resting", function chunkResting(socketID, data) {
    emitToSocket(socketID, "chunk_resting", data);
});

event.emitter.on("player_move", function onMove(playerID, x, y) {
    const linkedPlayers = playerLinks[playerID]
    if (linkedPlayers === undefined) return;
    linkedPlayers.forEach(player => {
        emitToSocket(player, "player_move", {
            id: playerID,
            x: x,
            y: y
        })
    })
})

event.emitter.on("player_in_range", function inRange(newPlayerID, moverID) {
    if (newPlayerID === moverID) return;
    newPlayerID in playerLinks ? playerLinks[newPlayerID].push(moverID) : playerLinks[newPlayerID] = [moverID];
    const mover = dbBackend.getPlayer(moverID)
    if (mover === undefined) return;
    emitToSocket(newPlayerID, "player_ir", {
        id: moverID,
        x: mover.x,
        y: mover.y,
        displayName: mover.displayName,
        item: mover.itemID,
        character: 0
    })
})

event.emitter.on("player_out_range", function inRange(newPlayerID, moverID) {
    if (playerLinks[newPlayerID] === undefined) return;
    playerLinks[newPlayerID] = playerLinks[newPlayerID].filter(player => player !== moverID);
    emitToSocket(newPlayerID, "player_oor", {
        id: moverID
    })
})

event.emitter.on("tile_change", function tileChange(playerID, tileID, itemID, senderID) {
    const tileX = (tileID % 9984) - 4492
    const tileY = Math.floor(tileID / 9984) - 4493
    emitToSocket(playerID, "update_tile", {
        x: tileX,
        y: tileY,
        colour: itemID,
        id: senderID
    })
})

event.emitter.on("afk_player", function afkPlayer(playerID) {
    emitToSocket(playerID, "kick_player", {
        msg:"You have been kicked for being AFK."
    })
    disconnectPlayer(playerID);
})

event.emitter.on("user_already_logged_in", function afkPlayer(playerID) {
    emitToSocket(playerID, "kick_player", {
        msg:"You have logged in from another location."
    })
    disconnectPlayer(playerID);
})

function emitToSocket(socketID, message, data) {
    io.to(socketID).emit(message, data);
}

function disconnectPlayer(userID) {
    const coords = dbBackend.getCoords(userID);
    // The user has already been removed from the server.
    if (coords === undefined) return;
    dbBackend.writePlayer(userID);
    event.emitter.emit("player_leave", userID, dbBackend.getCoords(userID))
    for (const playerID in playerLinks) {
        playerLinks[playerID] = playerLinks[playerID].filter(linkedPlayer => linkedPlayer !== userID);
    }
    delete playerLinks[userID]
    io.emit("player_leave", {id: userID})
    dbBackend.deletePlayer(userID);
}

function updateColour(x, y, colour, oldColour, senderID) {
    dbBackend.onNewColour(x, y, colour, oldColour, senderID);
}

function movePlayer(newX, newY, playerID) {
    const result = dbBackend.onMove(newX, newY, playerID);
    if (result !== null) {
        emitToSocket(playerID, "reset_position", {
            x: result.x,
            y: result.y
        });
    }
}

function init(server) {
    io = new Server(server);
    io.on("connection", (socket) => {

        socket.on("auth", (data) => {
            const token = data.token;
            const player = dbBackend.verifyAuthUser(token, socket.id);
            if (player === undefined) {
                io.emit("kick_player", {
                    msg: "Authorization token expired. Please log in again."
                })
                return;
            }

            socket.emit("auth_verify", {
                x: player.x,
                y: player.y,
                i: player.itemID
            })

            event.emitter.emit("player_join", socket.id, player.x, player.y)
        })

        socket.on("disconnect", (reason) => {
            disconnectPlayer(socket.id);
        })

        socket.on("new_colour", (data) => {
            updateColour(data.x, -data.y, data.colour, data.oldColour, data.id);
        })

        socket.on("move", (data) => {
            movePlayer(data.newX, data.newY, socket.id);
        })
        setInterval(timeoutCheck, 1000);
    })
}

function timeoutCheck() {
    dbBackend.kickAFKPlayers();
}

module.exports = {
    emitToSocket, init
}