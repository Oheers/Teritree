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

const utils = require("./utils.js");

const port = 3000

app.use(express.static('./public/'));

app.get('/', (req, res) => {
    res.status(200).sendFile(path.resolve(__dirname, './public/signin/core/auth.html'))
})

app.get('/play', (req, res) => {
    dbBackend.fetchAccount(req.query.id).then(r => {
        dbBackend.checkPlayerAlreadyLoggedIn(r.accountID)
        if (r.auth) {
            res.status(200).sendFile(path.resolve(__dirname, './public/main/core/index.html'))
        } else {
            res.status(200).sendFile(path.resolve(__dirname, './public/signin/core/auth.html'))
        }
    })
})

app.get('/changelog', (req, res) => {
    res.status(200).sendFile(path.resolve(__dirname, './public/changelog/core/changelog.html'));
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
})

app.post('/login-auth-token', bodyParser.json(), (req, res) => {
    const body = req.body;
    const authToken = body.token;
    dbBackend.selectPlayer(authToken).then(r => {
        res.json({
            auth: r.auth,
            token: authToken
        })
    })
})

app.post('/create-town', bodyParser.json(), (req, res) => {
    const id = req.query.socket_id;
    const player = dbBackend.getPlayer(id);

    const body = req.body;
    const town_name = body.town_name;

    // Backend verification that there's a town name.
    if (town_name === undefined || town_name.length < 4 || town_name.length > 32) {
        res.json({
            success: false,
            error: "town-name-error:You need to specify a town name."
        })
        return;
    }

    const town = dbBackend.getTown(town_name).then(r => {
        if (r !== undefined) {
            res.json({
                success: false,
                error: "town-name-error:Town name already exists."
            })
        } else {
            const town_colour = body.colour;
            console.log("town_colour:", town_colour)
            if (town_colour === undefined || town_colour % 1 !== 0 || town_colour > 7 || town_colour < 0) {
                res.json({
                    success: false,
                    error: "town-colour-error:You need to specify a colour for your town to represent."
                })
                return;
            }

            const town_invitecode = body.invite_code;
            console.log("invite code:", town_invitecode)
            if (town_invitecode === undefined || town_invitecode.length === 0) {
                res.json({
                    success: false,
                    error: "town-invitecode-error:This section cannot be empty."
                })
                return;
            }

            const town_description = body.town_description;
            const town_inviteonly = body.invite_only;

            let town_region = 0
            if (body.region > 36 || body.region < 1) town_region = Math.ceil(Math.random() * 36)
            else town_region = body.region;

            const x = Math.round((((town_region - 1) % 6) - 3) * 1664);
            const y = -Math.round((Math.floor((town_region - 1) / 6) - 3) * 1664);
            const chunkID = utils.getChunkID(Math.floor(+(Math.random()*52) + (x / 32)), Math.floor(-(Math.random()*52) + (y / 32)));

            dbBackend.createTown(player, town_name, town_description, town_inviteonly, town_invitecode, town_colour).then(r => {
                res.json({
                    success: true,
                    location: chunkID
                })
            })
        }
    })
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
        seed: 521,
        lastWorldReset: weekStartMS
    })
})

server.listen(port, () => {
    console.log("Server Initiated.");
})










