const socket = io();

const authToken = getCookie("authToken");
socket.emit("auth", {
    token: authToken
})

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

socket.on("update_tile", (data) => {
    if (data.id === socket.id) return;
    terrain.decorMap[data.x] ??= {}
    if (terrain.decorMap[data.x][data.y] === undefined) {
        terrain.decorMap[data.x][data.y] = new SpriteElement(terrain.scaledSquareSize, terrain.scaledSquareSize, (data.x - camCentreX) * terrain.scaledSquareSize, (-data.y + camCentreY) * terrain.scaledSquareSize, data.colour)
        terrain.decorMap[data.x][data.y].cacheElement(data.x, data.y)
    } else {
        terrain.decorMap[data.x][data.y].changeSprite(data.colour, data.x, data.y, false);
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

socket.on("kick_player", (data) => {
    renderer.loading = false;
    renderer.error = true;
    renderer.errorMSG = data.msg;
})

socket.on("player_join", (data) => {
    if (data.id !== socket.id) {
        terrain.addNewPlayer(data.id, false, data.x - (camCentreX * terrain.scaledSquareSize), data.y + (camCentreY * terrain.scaledSquareSize), data.displayName, data.character)
    }
})

socket.on("player_move", (data) => {
    console.log("player move:", data)
    if (data.id === socket.id) return;
    const player = terrain.players[data.id];
    if (player === undefined) return;
    player.element.move(data.x * terrain.scaledSquareSize, data.y * terrain.scaledSquareSize)
})

socket.on("player_leave", (data) => {
    if (data.id === socket.id) return;
    delete terrain.players[data.id]
})

socket.on("connect", () => {
    document.querySelectorAll('.ui').forEach(element => {
        element.style.display = 'block';
    });
})

socket.on("disconnect", () => {
    renderer.error = true;
    renderer.errorMSG = "Disconnected from server."
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
