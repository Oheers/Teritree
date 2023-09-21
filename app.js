const path = require("path");
const express = require("express");
const app = express();

app.use(express.static('./public'));

app.get('/', (req, res) => {
    res.status(200).sendFile(path.resolve(__dirname, './public/index.html'))
})

app.listen(443, () => {
    console.log("Server Initiated.");
})