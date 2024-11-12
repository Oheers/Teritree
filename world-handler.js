const utils = require("./utils.js");
const dbManager = require("./database.js");
const event = require("./event-manager.js");

const cache = {};
const cacheUpdateTimes = {};

/* cache:
876261: {
    chunk: { chunk history },
    users: [ connected users]
}
 */

function changeInternalCache(newRenderRegion, oldRenderRegion, socketID) {
    if (newRenderRegion.x === oldRenderRegion.x) {} // Stopping the else statement triggering if moving up/down
    else if (newRenderRegion.x > oldRenderRegion.x) {
        // Player has moved EAST into a new render region
        const chunk1 = utils.getChunkID(newRenderRegion.x, newRenderRegion.y)
        const chunk2 = utils.getChunkID(newRenderRegion.x, newRenderRegion.y + 1)
        cacheNewChunks(chunk1, chunk2, socketID)

        // Removing player from unloaded chunks and deleting chunk if no longer needed.
        const unload1 = utils.getChunkID(newRenderRegion.x - 2, newRenderRegion.y);
        const unload2 = utils.getChunkID(newRenderRegion.x - 2, newRenderRegion.y + 1);

        const middle1 = utils.getChunkID(newRenderRegion.x - 1, newRenderRegion.y);
        const middle2 = utils.getChunkID(newRenderRegion.x - 1, newRenderRegion.y + 1);

        broadcastChangesInPlayerChunks(chunk1, chunk2, middle1, middle2, unload1, unload2, socketID)

        uncacheChunks(unload1, unload2, socketID)
    } else {
        // Player has moved WEST into a new render region
        const chunk1 = utils.getChunkID(newRenderRegion.x - 1, newRenderRegion.y)
        const chunk2 = utils.getChunkID(newRenderRegion.x - 1, newRenderRegion.y + 1)
        cacheNewChunks(chunk1, chunk2, socketID)

        // Removing player from unloaded chunks and deleting chunk if no longer needed.
        const unload1 = utils.getChunkID(newRenderRegion.x + 1, newRenderRegion.y);
        const unload2 = utils.getChunkID(newRenderRegion.x + 1, newRenderRegion.y + 1);

        const middle1 = utils.getChunkID(newRenderRegion.x, newRenderRegion.y);
        const middle2 = utils.getChunkID(newRenderRegion.x, newRenderRegion.y + 1);

        broadcastChangesInPlayerChunks(chunk1, chunk2, middle1, middle2, unload1, unload2, socketID)

        uncacheChunks(unload1, unload2, socketID)
    }

    if (newRenderRegion.y === oldRenderRegion.y) {} // Stopping the else statement triggering if moving up/down
    else if (newRenderRegion.y > oldRenderRegion.y) {
        // Player has moved NORTH into a new render region
        const chunk1 = utils.getChunkID(newRenderRegion.x - 1, newRenderRegion.y + 1)
        const chunk2 = utils.getChunkID(newRenderRegion.x, newRenderRegion.y + 1)
        cacheNewChunks(chunk1, chunk2, socketID)

        // Removing player from unloaded chunks and deleting chunk if no longer needed.
        const unload1 = utils.getChunkID(newRenderRegion.x, newRenderRegion.y - 1);
        const unload2 = utils.getChunkID(newRenderRegion.x - 1, newRenderRegion.y - 1);

        const middle1 = utils.getChunkID(newRenderRegion.x, newRenderRegion.y);
        const middle2 = utils.getChunkID(newRenderRegion.x - 1, newRenderRegion.y);

        broadcastChangesInPlayerChunks(chunk1, chunk2, middle1, middle2, unload1, unload2, socketID)

        uncacheChunks(unload1, unload2, socketID)
    } else {
        // Player has moved SOUTH into a new render region
        const chunk1 = utils.getChunkID(newRenderRegion.x, newRenderRegion.y)
        const chunk2 = utils.getChunkID(newRenderRegion.x - 1, newRenderRegion.y)
        cacheNewChunks(chunk1, chunk2, socketID)

        // Removing player from unloaded chunks and deleting chunk if no longer needed.
        const unload1 = utils.getChunkID(newRenderRegion.x, newRenderRegion.y + 2);
        const unload2 = utils.getChunkID(newRenderRegion.x - 1, newRenderRegion.y + 2);

        const middle1 = utils.getChunkID(newRenderRegion.x, newRenderRegion.y + 1);
        const middle2 = utils.getChunkID(newRenderRegion.x - 1, newRenderRegion.y + 1);

        broadcastChangesInPlayerChunks(chunk1, chunk2, middle1, middle2, unload1, unload2, socketID)

        uncacheChunks(unload1, unload2, socketID)
    }
}

// Figures out which players are no longer within the moving player's render region and broadcasts relevant data to them
// via the WebSocket server.
function broadcastChangesInPlayerChunks(newChunk1, newChunk2, middleChunk1, middleChunk2, oldChunk1, oldChunk2, moverID) {
    const newChunks = merge(getActivePlayers(newChunk1), getActivePlayers(newChunk2));
    const middleChunks = merge(getActivePlayers(middleChunk1), getActivePlayers(middleChunk2))
    const oldChunks = merge(getActivePlayers(oldChunk1), getActivePlayers(oldChunk2))
    const uniqueOldPlayers = oldChunks.filter(item => !middleChunks.includes(item))
    const uniqueNewPlayers = newChunks.filter(item => !middleChunks.includes(item))
    for (const playerID in uniqueNewPlayers) {
        event.emitter.emit("player_in_range", uniqueNewPlayers[playerID], moverID)
        event.emitter.emit("player_in_range", moverID, uniqueNewPlayers[playerID])
    }
    for (const playerID in uniqueOldPlayers) {
        event.emitter.emit("player_out_range", uniqueOldPlayers[playerID], moverID)
        event.emitter.emit("player_out_range", moverID, uniqueOldPlayers[playerID])
    }
}

// Gets players that are active in the unloaded chunk
function getActivePlayers(chunkID) {
    const chunk = cache[chunkID];
    if (chunk === undefined) return [];
    return chunk.users;
}

function removePlayerFromCachedChunk(chunkID, playerID) {
    const cachedChunk = cache[chunkID];
    if (cachedChunk === undefined) {
        return;
    }
    const activeUsers = cachedChunk.users;
    if (activeUsers.length === 1) {
        // ^ This is the only player using this chunk, it can be unloaded from internal cache.
        if (activeUsers[0] === playerID) {
            // ^ Belt & braces safety check in the if statement above, we really don't want to un-cache a chunk if a
            // player's using it. Set to only drop the data completely to stop the player moving between render regions
            // and causing lots of reads/writes.
            cachedChunk.users = []
            setTimeout(() => {
                if (cachedChunk.users.length === 0) {
                    if (cachedChunk.chunk.length === 0) {
                        delete cache[chunkID];
                        return;
                    }
                    dbManager.cacheChunk(chunkID, cachedChunk.chunk, cacheUpdateTimes).then(
                        r => delete cache[chunkID])
                }
            }, 60000);
        }
    } else {
        const index = cachedChunk.users.indexOf(playerID);
        if (index !== -1) {
            // Delete user from cache dictionary reference but leave other players in
            cachedChunk.users.splice(index, 1);
        }
    }
}

event.emitter.on("player_join", function playerJoin(socketID, x, y) {
    registerPlayerWithArea(socketID, x, y);
});

event.emitter.on("player_leave", function playerLeave(socketID, coords) {
    unregisterPlayerWithArea(socketID);
})

async function downloadChunk(chunkID) {
    return await dbManager.fetchChunkUpdates(chunkID);
}

async function restChunk(chunkID, time) {
    const cachedChunk = cache[chunkID];
    if (cachedChunk === undefined) return [];
    const updateMap = cachedChunk.chunk;
    const resultMap = []
    updateMap.forEach((tile) => {
        if (tile.epochTime > time) {
            resultMap.push({
                tileID: tile.tileID,
                itemID: tile.itemID,
            });
        }
    })
    return resultMap;
}

function existsInCache(chunkID) {
    return chunkID in cache;
}

function cacheNewChunks(chunk1, chunk2, socketID) {
    cacheNewChunk(chunk1, socketID)
    cacheNewChunk(chunk2, socketID)
}

function registerPlayerWithArea(socketID, x, y) {
    return new Promise((resolve => {
        const currentRenderRegion = utils.findRenderRegion(x, y);
        cacheNewChunk(utils.getChunkID(currentRenderRegion.x - 1, currentRenderRegion.y + 1), socketID).then(r => {
            cacheNewChunk(utils.getChunkID(currentRenderRegion.x, currentRenderRegion.y + 1), socketID).then(r2 => {
                cacheNewChunk(utils.getChunkID(currentRenderRegion.x -1, currentRenderRegion.y), socketID).then(r3 => {
                    cacheNewChunk(utils.getChunkID(currentRenderRegion.x, currentRenderRegion.y), socketID).then (r4 => {
                        const nearbyPlayers = new Set()
                        getActivePlayers(utils.getChunkID(Math.floor(x/32), Math.ceil(y/-32))).forEach((playerID) => {
                            nearbyPlayers.add(playerID);
                        })
                        getActivePlayers(utils.getChunkID(Math.floor(x/32) - 1, Math.ceil(y/-32) + 1)).forEach((playerID) => {
                            nearbyPlayers.add(playerID);
                        })
                        getActivePlayers(utils.getChunkID(Math.floor(x/32), Math.ceil(y/-32) + 1)).forEach((playerID) => {
                            nearbyPlayers.add(playerID);
                        })
                        getActivePlayers(utils.getChunkID(Math.floor(x/32) - 1, Math.ceil(y/-32))).forEach((playerID) => {
                            nearbyPlayers.add(playerID);
                        })

                        nearbyPlayers.forEach((playerID) => {
                            event.emitter.emit("player_in_range", playerID, socketID)
                            event.emitter.emit("player_in_range", socketID, playerID)
                        });
                        resolve();
                    })
                })
            })
        })
    }))
}

function unregisterPlayerWithArea(socketID) {
    for (const chunk in cache) {
        removePlayerFromCachedChunk(chunk, socketID)
    }
}

function cacheNewChunk(chunk, socketID) {
    return new Promise((resolve) => {
        if (!existsInCache(chunk)) {
            downloadChunk(chunk, 0).then(r => {
                cache[chunk] = {
                    chunk: r[0],
                    users: [socketID]
                };
                event.emitter.emit("chunk_resting", socketID, chunk)

                resolve();
            })
        } else {
            cache[chunk].users.push(socketID)
            event.emitter.emit("chunk_resting", socketID, chunk)
            resolve();
        }
    })
}

function uncacheChunks(chunk1, chunk2, socketID) {
    for (const chunkID in cache) {
        // Check if the current item meets the criteria, e.g., equal to 3
        if (cache.hasOwnProperty(chunkID) && ( chunkID === chunk1.toString() || chunkID === chunk2.toString() )) {
            removePlayerFromCachedChunk(chunkID, socketID)
        }
    }
}

function onTileChange(chunkID, tileID, colourID, senderID) {
    if (cache[chunkID] === undefined) console.error(`Fatal error while writing to ${chunkID}, loaded cache:`, cache)
    const updateMap = cache[chunkID].chunk;
    if (updateMap === null) return;
    const time = Date.now();
    // Sends a message down the WS server to all players currently viewing the chunk.
    cache[chunkID].users.forEach(userID => {
        event.emitter.emit("tile_change", userID, tileID, colourID, senderID)
    })
    cacheUpdateTimes[tileID] = time;
    for (let i=0; i < updateMap.length; i++) {
        if (updateMap[i].tileID === tileID) {
            updateMap[i].itemID = colourID;
            updateMap[i].epochTime = time;
            return;
        }
    }
    updateMap.push({
        tileID: tileID,
        itemID: colourID,
        epochTime: time
    })
    // Preventing server crash from deleting data. @TODO IMPLEMENT PROPER WORLD SAVING
    cacheAllChunks();
}

async function cacheAllChunks() {
    for (const chunkID in cache) {
        dbManager.cacheChunk(chunkID, cache[chunkID].chunk, cacheUpdateTimes)
    }
}

function merge(array1, array2) {
    return Array.from(new Set(array1.concat(array2)));
}

module.exports = {
    changeInternalCache, downloadChunk, onTileChange, restChunk, registerPlayerWithArea, unregisterPlayerWithArea
}