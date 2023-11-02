const path = require("path");
const express = require("express");
const app = express();

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const dbBackend = require("./sql-backend")

const port = 3000

app.use(express.static('./public'));

app.get('/', (req, res) => {
    res.status(200).sendFile(path.resolve(__dirname, './public/index.html'))
})

const users = { }
const { Player } = require("./objects/player.js")

io.on("connection", (socket) => {
    const playerObject = new Player(526, 527, 0, 0, 10000, 2, "Oheers", 1, 1);
    dbBackend.addPlayer(playerObject, socket.id)

    socket.on("disconnect", (reason) => {
        dbBackend.deletePlayer(socket.id);
    })

    socket.on("new_colour", (data) => {
        dbBackend.onNewColour(data.x, data.y, data.colour)
        io.emit("update_tile", data);
    })

    socket.on("move", (data) => {
        const result = dbBackend.onMove(data.newX, data.newY, socket.id);
        if (result !== null) {
            socket.emit("reset_position", {
                x: result.x,
                y: result.y
            })
        }
    })
})

server.listen(port, () => {
    console.log("Server Initiated.");
})










