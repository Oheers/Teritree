socket.on("update_tile", (data) => {
    if (data.id === socket.id) return;
    const relevantRenderRegion = terrain.findRenderRegion(data.x, data.y);
    const playerRenderRegion = terrain.findRenderRegion(camCentreX, camCentreY);
    if (relevantRenderRegion.x === playerRenderRegion.x && relevantRenderRegion.y === relevantRenderRegion.y) {
        const tile = terrain.terrainMap[data.x][data.y];
        tile.setColour(data.colour)
        const realX = Math.floor(mouseX/terrain.scaledSquareSize)
        const realY = Math.floor(mouseY/terrain.scaledSquareSize)
        tile.cacheElement(realX, realY);
    }
});