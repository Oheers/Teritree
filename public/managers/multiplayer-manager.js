const socket = io();

socket.on("update_tile", (data) => {
    if (data.id === socket.id) return;
    const relevantRenderRegion = terrain.findRenderRegion(data.x, data.y);
    const playerRenderRegion = terrain.findRenderRegion(camCentreX, camCentreY);
    if (relevantRenderRegion.x === playerRenderRegion.x && relevantRenderRegion.y === relevantRenderRegion.y) {
        terrain.decorMap[data.x] ??= {}
        if (terrain.decorMap[data.x][-data.y] === undefined) {
            const correspondingTile = terrain.terrainMap[data.x][data.y]
            terrain.decorMap[data.x][-data.y] = new SpriteElement(terrain.scaledSquareSize, terrain.scaledSquareSize, correspondingTile.x, correspondingTile.y, data.colour)
        } else {
            terrain.decorMap[data.x][-data.y].changeSprite(data.colour, false);
        }
    }
});

socket.on("reset_position", (data) => {
    inputHandler.updatePositioning((camCentreX - data.x) * terrain.scaledSquareSize, (data.y - camCentreY) * terrain.scaledSquareSize, false);
});

// new player coming into range
socket.on("player_ir", (data) => {
    if (data.id !== socket.id) {
        terrain.addNewPlayer(data.id, false, (data.x - camCentreX) * terrain.scaledSquareSize, (-data.y + camCentreY) * terrain.scaledSquareSize, data.displayName, data.character)
    }
})

// player out of range, no longer within the current render region.
socket.on("player_oor", (data) => {
    delete terrain.players[data.id];
})

socket.on("chunk_resting", (data) => {
    if (data in terrain.activeChunks) {
        const chunk = terrain.activeChunks[data];
        fetchRestingChunk(data, chunk.chunk.saveTime)
    } else {
        terrain.restingQueue.push(data)
    }
})

socket.on("player_join", (data) => {
    if (data.id !== socket.id) {
        terrain.addNewPlayer(data.id, false, data.x - (camCentreX * terrain.scaledSquareSize), data.y + (camCentreY * terrain.scaledSquareSize), data.displayName, data.character)
    }
})

socket.on("player_move", (data) => {
    if (data.id === socket.id) return;
    const player = terrain.players[data.id];
    if (player === undefined) return;
    player.element.move(data.x * terrain.scaledSquareSize, data.y * terrain.scaledSquareSize)
})

socket.on("player_leave", (data) => {
    if (data.id === socket.id) return;
    delete terrain.players[data.id]
})

function fetchRestingChunk(chunkID, saveTime) {
    fetch(`/api/world/chunk/${chunkID}?time=${saveTime}`)
        .then(r => {
            return r.json();
        })
        .then(tileList => {
                tileList.forEach(tile => {
                    terrain.actionRestUpdate(tile.tileID, tile.itemID)
                })
            }
        )
}

async function fetchWorldData() {
    try {
        const response = await fetch(`/api/world/info`);
        const data = await response.json();

        if (data === undefined) {
            return false;
        }

        terrain.seed = data.seed;
        terrain.lastWorldReset = data.lastWorldReset;

        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}
