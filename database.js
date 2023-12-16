const mysql = require("mysql2/promise");
const auth = require('./auth-account.js')

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
    return await connection.query(`SELECT tileID, itemID, epochTime FROM teritree_world WHERE chunkID = ${chunkID}`);
}

async function cacheChunk(chunkID, updateMap, updateTimes) {
    // Builds the initial query
    let query = "INSERT INTO teritree_world (chunkID, tileID, itemID, epochTime) VALUES ";
    let tiles = "";
    updateMap.forEach((values, index) => {
        // The update times aren't stored with the update map, we need to find the relevant update time and delete it.
        const updateTime = updateTimes[values.tileID];
        // If there's no update time referenced, this means the data hasn't been modified since it left the SQL server.
        if (updateTime === undefined) return;
        delete updateTimes[values.tileID]
        // Adding data from the update map into the query.
        tiles += `(${chunkID}, ${values.tileID}, '${values.itemID}', ${updateTime})`;
        if (index !== updateMap.length - 1) {
            tiles += ",";
        }
    });
    if (tiles === "") return;
    else query += tiles;
    // Handling duplicate values, we don't want to write a load of new data each time we re-write to the SQL server.
    query += "\nON DUPLICATE KEY UPDATE itemID = VALUES(itemID), epochTime = COALESCE(VALUES(epochTime), epochTime);";

    await connection.query(query);
}

module.exports = {
    sendTileUpdate, fetchChunkUpdates, cacheChunk
}