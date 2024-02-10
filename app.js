const path = require("path");
const express = require("express");
const app = express();
const bodyParser = require('body-parser');

const http = require("http");
const server = http.createServer(app);
const ws = require("./ws-handler.js");
ws.init(server);
const crypto = require('crypto');
const dbBackend = require("./sql-backend")
const worldHandler = require("./world-handler.js");

const port = 3000

app.use(express.static('./public/'));

app.get('/', (req, res) => {
    res.status(200).sendFile(path.resolve(__dirname, './public/signin/core/auth.html'))
})

app.get('/play', (req, res) => {
    dbBackend.fetchAccount(req.query.id).then(r => {
        if (r.auth) {
            res.status(200).sendFile(path.resolve(__dirname, './public/main/core/index.html'))
        } else {
            console.log("not authed, signing to sign in:")
            res.status(200).sendFile(path.resolve(__dirname, './public/signin/core/auth.html'))
        }
    })
})

app.post('/login', bodyParser.json(), (req, res) => {
    const body = req.body;
    dbBackend.signin(body.username, body.password).then(r => {
        res.json({
            auth: r.auth,
            token: r.token
        })
    })
})

app.post('/signup', bodyParser.json(), (req, res) => {
    const body = req.body;
    const authToken = crypto.randomBytes(8).toString("hex");
    dbBackend.createAccount(body.username, body.password, authToken).then(r => {
        if (r) {
            res.json({
                auth: true,
                token: authToken
            })
        } else {
            res.json({
                auth: false
            })
        }
    })
    console.log("req:", req.body);
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
        seed: 55035,
        lastWorldReset: weekStartMS
    })
})

server.listen(port, () => {
    console.log("Server Initiated.");
})










