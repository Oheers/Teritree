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

io.on("connection", (socket) => {
    users[socket.id] = {
        x: 0,
        y: 0
    }

    socket.on("disconnect", (reason) => {
        delete users[socket.id];
    })

    socket.on("new_colour", (data) => {
        dbBackend.onNewColour(data.x, data.y, data.colour)
        io.emit("update_tile", data);
    })
})

server.listen(port, () => {
    console.log("Server Initiated.");
})










