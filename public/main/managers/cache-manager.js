function cacheChunk(x, y, localMap, saveTime) {
    localStorage.setItem(getChunkID(x, y), JSON.stringify({
        map: localMap, saveTime: saveTime
    }));
}

function fetchCache(x, y) {
    const cachedData = localStorage.getItem(getChunkID(x, y));
    // No cache exists for this chunk, so we might as well return empty data.
    if (cachedData === null) {
        return {
            map: [],
            saveTime: 0
        };
    }

    const parsedData = JSON.parse(cachedData);
    // If the cached data is too old, it needs to be discarded, so empty data is returned.
    if (parsedData.saveTime < terrain.lastWorldReset) {
        return {
            map: [],
            saveTime: 0
        };
    }

    // Normal case, data is fetched from the cache and returned.
    return {
        map: parsedData.map,
        saveTime: parsedData.saveTime
    };
}

function getChunkID(x, y) {
    return ((157 - y) * 312) + (x + 156)
}