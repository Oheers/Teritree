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
    emitToSocket(newPlayerID, "player_ir", {
        id: moverID,
        x: mover.x,
        y: mover.y,
        displayName: "ed",
        character: 0
    })
})

event.emitter.on("player_out_range", function inRange(newPlayerID, moverID) {
    playerLinks[newPlayerID] = playerLinks[newPlayerID].filter(player => player !== moverID);
    emitToSocket(newPlayerID, "player_oor", {
        id: moverID
    })
})

function emitToSocket(socketID, message, data) {
    io.to(socketID).emit(message, data);
}

function disconnectPlayer(userID) {
    event.emitter.emit("player_leave", userID, dbBackend.getCoords(userID))
    for (const playerID in playerLinks) {
        playerLinks[playerID] = playerLinks[playerID].filter(linkedPlayer => linkedPlayer !== userID);
    }
    delete playerLinks[userID]
    io.emit("player_leave", {id: userID})
    dbBackend.deletePlayer(userID);
}

function updateColour(x, y, colour) {
    dbBackend.onNewColour(x, y, colour);
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
        const x = 0;
        const y = 0;
        const playerObject = new Player(526, 527, x, y, 10000, 2, "ed", 1, 1);
        dbBackend.addPlayer(playerObject, socket.id)
        event.emitter.emit("player_join", socket.id, x, y)
        io.emit("player_join", {
            id: socket.id,
            x: x,
            y: y,
            displayName: "ed",
            character: 0
        })

        socket.on("disconnect", (reason) => {
            disconnectPlayer(socket.id);
        })

        socket.on("new_colour", (data) => {
            updateColour(data.x, data.y, data.colour);
            io.emit("update_tile", data);
        })

        socket.on("move", (data) => {
            movePlayer(data.newX, data.newY, socket.id);
        })
    })
}

module.exports = {
    emitToSocket, init
}