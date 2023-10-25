socket.on("update_tile", (data) => {
    if (data.id === socket.id) return;
    const relevantRenderRegion = terrain.findRenderRegion(data.x, data.y);
    const playerRenderRegion = terrain.findRenderRegion(camCentreX, camCentreY);
    if (relevantRenderRegion.x === playerRenderRegion.x && relevantRenderRegion.y === relevantRenderRegion.y) {
        terrain.terrainMap[data.x][data.y].setColour(data.colour)
    }
});