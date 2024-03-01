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

function deleteCookie(cname) {
    document.cookie = cname + "=X;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/";
}

socket.on("update_tile", (data) => {
    if (data.id === socket.id) return;
    terrain.decorMap[data.x] ??= {}
    if (terrain.decorMap[data.x][data.y] === undefined) {
        terrain.decorMap[data.x][data.y] = new SpriteElement(terrain.scaledSquareSize, terrain.scaledSquareSize, (data.x - camCentreX) * terrain.scaledSquareSize, (-data.y + camCentreY) * terrain.scaledSquareSize, data.colour)
        terrain.decorMap[data.x][data.y].cacheElement(data.x, data.y)
        changePlayerItem(data.id, -1)
    } else {
        changePlayerItem(data.id, terrain.decorMap[data.x][data.y].itemID)
        terrain.decorMap[data.x][data.y].changeSprite(data.colour, data.x, data.y, false);
    }
});

socket.on("reset_position", (data) => {
    inputHandler.updatePositioning((camCentreX - data.x) * terrain.scaledSquareSize, (data.y - camCentreY) * terrain.scaledSquareSize, false);
});

// new player coming into range
socket.on("player_ir", (data) => {
    if (data.id !== socket.id) {
        terrain.addNewPlayer(data.id, false, (data.x - camCentreX) * terrain.scaledSquareSize, (-data.y + camCentreY) * terrain.scaledSquareSize, data.displayName, data.character, data.item)
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

socket.on("auth_verify", (data) => {
    camCentreX = data.x;
    camCentreY = data.y;
    itemID = data.i;
    changeHotbar();
    loadWorld();
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

async function postTownCreationData(town_name, town_description, invite_only, invite_code, colour) {
    const response = await fetch(`/create-town?socket_id=${socket.id}`, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify({
            town_name: town_name,
            town_description: town_description,
            invite_only: invite_only,
            invite_code: invite_code,
            colour: colour
        }) // body data type must match "Content-Type" header
    }).then(response => {
        return response.json();
    }).then(jsonResponse => {
        if (!jsonResponse.success) {
            const error = jsonResponse.error.split(":");
            document.getElementById(error[0]).style.visibility = "visible"
            document.getElementById(error[0]).innerHTML = error[1];
        }
        console.log("town creation response:", jsonResponse)
    })
}

function signout() {
    deleteCookie("authToken")
    window.location.href = `/`
}

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
