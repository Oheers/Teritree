function cacheChunk(x, y, localMap, saveTime) {
    localStorage.setItem(getChunkID(x, y), JSON.stringify({
        map: localMap, saveTime: saveTime
    }));
}

function fetchCache(x, y) {
    const cachedData = localStorage.getItem(getChunkID(x, y));
    if (cachedData === null) {
        return {
            map: [],
            saveTime: 0
        };
    }
    const parsedData = JSON.parse(cachedData);
    const map = parsedData.map;
    const saveTime = parsedData.saveTime;
    return {
        map: map,
        saveTime: saveTime
    };
}

function getChunkID(x, y) {
    return ((157 - y) * 312) + (x + 156)
}