socket.on("update_tile", (data) => {
    if (data.id === socket.id) return;
    const relevantRenderRegion = terrain.findRenderRegion(data.x, data.y);
    const playerRenderRegion = terrain.findRenderRegion(camCentreX, camCentreY);
    if (relevantRenderRegion.x === playerRenderRegion.x && relevantRenderRegion.y === relevantRenderRegion.y) {
        const tile = terrain.terrainMap[data.x][data.y];
        tile.setColour(data.colour)
        tile.cacheElement(data.x, data.y);
    }
});

socket.on("reset_position", (data) => {
    inputHandler.updatePositioning((camCentreX - data.x) * terrain.scaledSquareSize, (data.y - camCentreY) * terrain.scaledSquareSize, false);
});

socket.on("chunk_resting", (data) => {
    console.log("NEW CHUNK RESTING:", data)
})