function getChunkID(x, y) {
    return ((157 - y) * 312) + (x + 156);
}

function getTileID(x, y) {
    return ((4493 - y) * 9984) + (x + 4492)
}

function findRenderRegion(x, y) {
    return {
        x: Math.floor((x + 16) / 32),
        y: Math.ceil((y - 16) / 32)
    }
}

module.exports = {
    getChunkID, getTileID, findRenderRegion
}