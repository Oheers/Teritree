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

app.get('/play', (req, res) => {
    res.status(200).sendFile(path.resolve(__dirname, './public/core/auth.html'))
})

app.get('/', (req, res) => {
    res.status(200).sendFile(path.resolve(__dirname, './public/core/index.html'))
})

app.get('/api/world/chunk/:id', async (req, res) => {
    const chunkID = req.params.id;
    let viewTime = req.query.time;
    if (viewTime < weekStartMS) viewTime = weekStartMS
    const chunk = await worldHandler.restChunk(chunkID, viewTime);
    res.status(200).send(chunk)
})

const now = new Date();
const weekStartMS = Date.now() - (((now.getDay() + 6) % 7) * 86400000 +
    now.getHours() * 3600000 +
    now.getMinutes() * 60000 +
    now.getSeconds() * 1000);

app.get('/api/world/info', async (req, res) => {
    res.status(200).send({
        seed: 55030,
        lastWorldReset: weekStartMS
    })
})

server.listen(port, () => {
    console.log("Server Initiated.");
})










