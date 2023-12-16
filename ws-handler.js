const { Server } = require("socket.io");
const { Player } = require("./objects/player");
const dbBackend = require("./sql-backend");
const event = require("./event-manager.js");
let io;

event.emitter.on("chunk_resting", function chunkResting(socketID, data) {
    emitToSocket(socketID, "chunk_resting", data);
});

function emitToSocket(socketID, message, data) {
    io.to(socketID).emit(message, data);
}

function disconnectPlayer(playerID) {
    event.emitter.emit("player_leave", playerID, dbBackend.getCoords(playerID))
    dbBackend.deletePlayer(playerID);
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
        const playerObject = new Player(526, 527, x, y, 10000, 2, "Oheers", 1, 1);
        event.emitter.emit("player_join", socket.id, x, y)
        dbBackend.addPlayer(playerObject, socket.id)

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