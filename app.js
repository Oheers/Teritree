const path = require("path");
const express = require("express");
const app = express();

const http = require("http");
const server = http.createServer(app);
const ws = require("./ws-handler.js");
ws.init(server);
const dbBackend = require("./sql-backend")
const worldHandler = require("./world-handler.js");

const port = 3000

app.use(express.static('./public'));

app.get('/', (req, res) => {
    res.status(200).sendFile(path.resolve(__dirname, './public/index.html'))
})

app.get('/api/world/chunk/:id', async (req, res) => {
    const chunkID = req.params.id;
    const viewTime = req.query.time;
    const chunk = await worldHandler.restChunk(chunkID, viewTime);
    res.status(200).send(chunk)
})

const users = { }
const { Player } = require("./objects/player.js")

server.listen(port, () => {
    console.log("Server Initiated.");
})










