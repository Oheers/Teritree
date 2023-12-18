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
        const unloadable1 = utils.getChunkID(newRenderRegion.x - 2, newRenderRegion.y);
        const unloadable2 = utils.getChunkID(newRenderRegion.x - 2, newRenderRegion.y + 1);
        uncacheChunks(unloadable1, unloadable2, socketID)
    } else {
        // Player has moved WEST into a new render region
        const chunk1 = utils.getChunkID(newRenderRegion.x - 1, newRenderRegion.y)
        const chunk2 = utils.getChunkID(newRenderRegion.x - 1, newRenderRegion.y + 1)
        cacheNewChunks(chunk1, chunk2, socketID)

        // Removing player from unloaded chunks and deleting chunk if no longer needed.
        const unloadable1 = utils.getChunkID(newRenderRegion.x + 1, newRenderRegion.y);
        const unloadable2 = utils.getChunkID(newRenderRegion.x + 1, newRenderRegion.y + 1);
        uncacheChunks(unloadable1, unloadable2, socketID)
    }

    if (newRenderRegion.y === oldRenderRegion.y) {} // Stopping the else statement triggering if moving up/down
    else if (newRenderRegion.y > oldRenderRegion.y) {
        // Player has moved NORTH into a new render region
        const chunk1 = utils.getChunkID(newRenderRegion.x - 1, newRenderRegion.y + 1)
        const chunk2 = utils.getChunkID(newRenderRegion.x, newRenderRegion.y + 1)
        cacheNewChunks(chunk1, chunk2, socketID)

        // Removing player from unloaded chunks and deleting chunk if no longer needed.
        const unloadable1 = utils.getChunkID(newRenderRegion.x, newRenderRegion.y - 1);
        const unloadable2 = utils.getChunkID(newRenderRegion.x - 1, newRenderRegion.y - 1);
        uncacheChunks(unloadable1, unloadable2, socketID)
    } else {
        // Player has moved SOUTH into a new render region
        const chunk1 = utils.getChunkID(newRenderRegion.x, newRenderRegion.y)
        const chunk2 = utils.getChunkID(newRenderRegion.x - 1, newRenderRegion.y)
        cacheNewChunks(chunk1, chunk2, socketID)

        // Removing player from unloaded chunks and deleting chunk if no longer needed.
        const unloadable1 = utils.getChunkID(newRenderRegion.x, newRenderRegion.y + 2);
        const unloadable2 = utils.getChunkID(newRenderRegion.x - 1, newRenderRegion.y + 2);
        uncacheChunks(unloadable1, unloadable2, socketID)
    }
}

function removePlayerFromCachedChunk(chunkID, playerID) {
    const cachedChunk = cache[chunkID];
    if (cachedChunk === undefined) {
        console.log("CRASH PROTECTION: UNDEFINED CACHED CHUNK. DETAILS ON SESSION:\n", "cache:", cache, "chunkID:", chunkID, "playerID:", playerID, "cachedChunk:", cachedChunk)
    }
    const activeUsers = cachedChunk.users;
    if (activeUsers.length === 1) {
        // This is the only player using this chunk, it can be unloaded from internal cache.
        if (activeUsers[0] === playerID) {
            // Belt & braces safety check in the if statement above, we really don't want to un-cache a chunk if a
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
    cacheNewChunk(utils.getChunkID(Math.floor(x/32), Math.ceil(y/-32)), socketID)
    cacheNewChunk(utils.getChunkID(Math.floor(x/32) - 1, Math.ceil(y/-32) + 1), socketID)
    cacheNewChunk(utils.getChunkID(Math.floor(x/32), Math.ceil(y/-32) + 1), socketID)
    cacheNewChunk(utils.getChunkID(Math.floor(x/32) - 1, Math.ceil(y/-32)), socketID)
});

event.emitter.on("player_leave", function playerLeave(socketID, coords) {
    removePlayerFromCachedChunk(utils.getChunkID(Math.floor(coords.x/32), Math.ceil(coords.y/-32)), socketID)
    removePlayerFromCachedChunk(utils.getChunkID(Math.floor(coords.x/32) - 1, Math.ceil(coords.y/-32) + 1), socketID)
    removePlayerFromCachedChunk(utils.getChunkID(Math.floor(coords.x/32), Math.ceil(coords.y/-32) + 1), socketID)
    removePlayerFromCachedChunk(utils.getChunkID(Math.floor(coords.x/32) - 1, Math.ceil(coords.y/-32)), socketID)
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
                itemID: tile.itemID
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

function cacheNewChunk(chunk, socketID) {
    if (!existsInCache(chunk)) {
        downloadChunk(chunk, 0).then(r => {
            cache[chunk] = {
                chunk: r[0],
                users: [socketID]
            };
            event.emitter.emit("chunk_resting", socketID, chunk)
        })
    } else {
        cache[chunk].users.push(socketID)
        event.emitter.emit("chunk_resting", socketID, chunk)
    }
}

function uncacheChunks(chunk1, chunk2, socketID) {
    for (const chunkID in cache) {
        // Check if the current item meets the criteria, e.g., equal to 3
        if (cache.hasOwnProperty(chunkID) && ( chunkID === chunk1.toString() || chunkID === chunk2.toString() )) {
            removePlayerFromCachedChunk(chunkID, socketID)
        }
    }
}

function onTileChange(chunkID, tileID, colourID) {
    const start = Date.now();
    const updateMap = cache[chunkID].chunk;
    const time = Date.now();
    if (updateMap === null) return;
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
    if (Object.keys(cacheUpdateTimes).length > 10) {
        cacheAllChunks();
    }
}

async function cacheAllChunks() {
    for (const chunkID in cache) {
        dbManager.cacheChunk(chunkID, cache[chunkID].chunk, cacheUpdateTimes)
    }
}

module.exports = {
    changeInternalCache, downloadChunk, onTileChange, restChunk
}