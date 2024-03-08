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

async function newAccount(username, password, authToken, x, y) {
    return connection.query(`INSERT INTO teritree_users (username, password, token, x, y, itemID, townID, joinEpoch, ` +
        `competitionsWon, townRank, serverRank) VALUES ("${username}", "${password}", "${authToken}", "${x}", "${y}", "-1", "-1",` +
    `"${Date.now()}", "0", "-1", "0");`);
}

async function getAccount(username) {
    return connection.query(`SELECT username, password, token, x, y FROM teritree_users WHERE username = "${username}"`);
}

async function getAccountFromAuthToken(authToken) {
    return connection.query(`SELECT username, id, x, y, itemID FROM teritree_users WHERE token = "${authToken}"`);
}

async function getAllPlayers() {
    return connection.query(`SELECT * FROM teritree_users`);
}

async function updatePlayerRecord(userID, x, y, itemID) {
    return connection.query(`UPDATE teritree_users SET x = ${Math.round(x)}, y = ${Math.round(y)}, itemID = ${itemID} WHERE id = ${userID}`);
}

async function getTownFromName(name) {
    return connection.query(`SELECT * FROM teritree_towns WHERE name = "${name}";`)
}

async function getAllTowns() {
    return connection.query(`SELECT * FROM teritree_towns;`);
}

// Adds a new town to the SQL database.
async function createTown(leaderID, townName, townDescription, townInviteOnly, townInviteCode, townColour) {
    return connection.query(`INSERT INTO teritree_towns (leaderID, spawnX, spawnY, name, colourID, description, 
    invite_only, invite_code) VALUES (${leaderID}, 0, 0, "${townName}", ${townColour}, "${townDescription}", 
    ${townInviteOnly ? 1 : 0}, "${townInviteCode}");`)

}

// Registers a claim with the SQL database.
async function createClaim(chunkID, townID, isPublic) {
    console.log("creating town:", chunkID, townID, isPublic);
    return connection.query(`INSERT INTO teritree_claims (chunkID, townID, isPublic) VALUES (${chunkID}, ${townID}, 
    ${isPublic});`)
}

async function getAllClaims() {
    return connection.query(`SELECT * FROM teritree_claims;`);
}

module.exports = {
    sendTileUpdate, fetchChunkUpdates, cacheChunk, newAccount, getAccount, getAccountFromAuthToken, updatePlayerRecord,
    getTownFromName, createTown, getAllTowns, getAllPlayers, createClaim, getAllClaims
}