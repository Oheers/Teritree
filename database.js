const mysql = require("mysql2");
const auth = require('./auth-account.js')

const connection = mysql.createConnection({
    host     : auth.host,
    user     : auth.user,
    password : auth.password,
    database : auth.dbName
});

connection.connect(function(err) {
    if (err) {
        console.error('Error Connecting: ' + err.stack);
        return;
    }

    console.log('Connected as ID ' + connection.threadId);
});

function sendTileUpdate(chunkID, tileID, itemID, epochTime) {
    connection.query(
        "INSERT INTO teritree_world (chunkID, tileID, itemID, epochTime)\n" +
        `VALUES (${chunkID}, ${tileID}, '${itemID}', ${epochTime})\n` +
        "ON DUPLICATE KEY UPDATE\n" +
        "itemID = VALUES(itemID),\n" +
        "epochTime = VALUES(epochTime);",
        function (err, result) {
            if (err) throw err;
        }
    )
}

module.exports = {
    sendTileUpdate
}