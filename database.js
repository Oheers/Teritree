const mysql = require("mysql2/promise");
const auth = require('./auth-account.js')
const {user} = require("./auth-account");

const connection = mysql.createPool({
    host     : auth.host,
    user     : auth.user,
    password : auth.password,
    database : auth.dbName
});

async function sendTileUpdate(chunkID, tileID, itemID, epochTime) {

    await connection.query(
        "INSERT INTO teritree_world (chunkID, tileID, itemID, epochTime)\n" +
        `VALUES (${chunkID}, ${tileID}, '${itemID}', ${epochTime})\n` +
        "ON DUPLICATE KEY UPDATE\n" +
        "itemID = VALUES(itemID),\n" +
        "epochTime = VALUES(epochTime);"
    )
}

async function fetchChunkUpdates(chunkID) {
    return connection.query(`SELECT tileID, itemID, epochTime FROM teritree_world WHERE chunkID = ${chunkID}`);
}

async function cacheChunk(chunkID, updateMap, updateTimes) {
    // Builds the initial query
    let query = "INSERT INTO teritree_world (chunkID, tileID, itemID, epochTime) VALUES ";
    let tiles = [];
    updateMap.forEach((values, index) => {
        // The update times aren't stored with the update map, we need to find the relevant update time and delete it.
        const updateTime = updateTimes[values.tileID];
        // If there's no update time referenced, this means the data hasn't been modified since it left the SQL server.
        if (updateTime === undefined) return;
        // Adding data from the update map into the query.
        tiles.push(`(${chunkID}, ${values.tileID}, '${values.itemID}', ${updateTime})`);
        delete updateTimes[values.tileID];
    });
    if (tiles.length === 0) return;
    // Handling duplicate values, we don't want to write a load of new data each time we re-write to the SQL server.
    query += tiles.join(", ") + " ON DUPLICATE KEY UPDATE itemID = VALUES(itemID), epochTime = COALESCE(VALUES(epochTime), epochTime);";

    await connection.query(query);
}

async function newAccount(username, password, authToken) {
    return connection.query(`INSERT INTO teritree_users (username, password, token) VALUES ("${username}", "${password}", "${authToken}")`);
}

async function getAccount(username) {
    return connection.query(`SELECT username, password, token FROM teritree_users WHERE username = "${username}"`);
}

async function getAccountFromAuthToken(authToken) {
    return connection.query(`SELECT username, id FROM teritree_users WHERE token = "${authToken}"`);
}

module.exports = {
    sendTileUpdate, fetchChunkUpdates, cacheChunk, newAccount, getAccount, getAccountFromAuthToken
}