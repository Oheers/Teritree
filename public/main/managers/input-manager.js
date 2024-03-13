let camCentreX = 0;
let camCentreY = 0;
let mouseX = 0;
let mouseY = 0;
let draw = false;
let keyMap = {};
let moveSpeed = 4
let movementLock = false;

let townX = 0;
let townY = 0;

class InputManager {

    constructor() {
        window.addEventListener('keydown', this.keyDownProcessor, false)
        window.addEventListener('keyup', this.keyUpProcessor, false)
        window.addEventListener("mousemove", this.onMouseMove, false);
        window.addEventListener("mousedown", this.onMouseDown, false); // @TODO THIS HERE !!!!!!!!!!!!
        window.addEventListener("mouseup", this.onMouseUp, false);

        moveSpeed = terrain.scaledSquareSize / 100;
    }

    tick(timeDiff) {
        if (!renderer.isFocus) return;
        this.fetchMousePress();
        const keyResult = this.fetchKeyPress();
        keyResult.x *= (timeDiff / 50) * moveSpeed;
        keyResult.y *= (timeDiff / 50) * moveSpeed;
        const x = keyResult.x;
        const y = keyResult.y;
        this.updatePositioning(x, y, true);
        lastUpdated = Date.now();
    }

    updatePositioning(x, y, back) {
        if (movementLock) return;
        const oldX = camCentreX;
        const oldY = camCentreY;

        if (camCentreX + (x / terrain.scaledSquareSize) > 4492 && x < 0) {
            // Game restores the x coordinates to be within the brackets if the movement requested is too great.
            x = 0;
        } else if (camCentreX + (x / terrain.scaledSquareSize) < -4492 && x > 0) {
            x = 0;
        }

        if (camCentreY + (y / terrain.scaledSquareSize) > 4492 && y > 0) {
            // Game restores the y coordinates to be within the brackets if the movement requested is too great.
            y = 0;
        } else if (camCentreY + (y / terrain.scaledSquareSize) < -4492 && y < 0) {
            y = 0;
        }

        camCentreX += (-(x / terrain.scaledSquareSize));
        camCentreY += (y / terrain.scaledSquareSize);
        mouseX -= (x);
        mouseY -= (y);

        renderer.translate(x, y, terrain.terrainMap);
        renderer.translate(x, y, terrain.decorMap);
        renderer.translateUI(x, y, renderer.uiMap);
        renderer.translatePlayers(x, y);

        renderer.repositionTownIndicator();

        terrain.fetchLocalTerrain(camCentreX, camCentreY, oldX, oldY);

        if (!back || (x === 0 && y === 0)) return;
        Math.abs(Math.floor(camCentreX + 0.5) - Math.floor(mouseX / terrain.scaledSquareSize)) > 1
        || Math.abs(Math.floor(camCentreY + 0.5) + Math.floor(mouseY / terrain.scaledSquareSize)) > 1 ?
            renderer.uiMap["selector"].opacity = 0.2 : renderer.uiMap["selector"].opacity = 1;
        socket.emit("move", {
            newX: camCentreX,
            newY: camCentreY
        })
    }

    fetchMousePress() {
        if (draw) {
            draw = false;
            const tileX = Math.floor(mouseX / terrain.scaledSquareSize);
            const tileY = -Math.floor(mouseY / terrain.scaledSquareSize);
            if (Math.abs(Math.floor(camCentreX + 0.5) - tileX) > 1
                || Math.abs(Math.floor(camCentreY + 0.5) - tileY) > 1) return;
            try {
                terrain.decorMap[tileX] ??= {};
                if (terrain.decorMap[tileX][tileY] === undefined || terrain.decorMap[tileX][tileY].itemID === -1 || sprites[terrain.decorMap[tileX][tileY].itemID].replaceable) {
                    if (itemID === -1) return;
                    if (this.placingOnOcean(tileX, tileY)) return;
                    terrain.decorMap[tileX][tileY] = new SpriteElement(terrain.scaledSquareSize, terrain.scaledSquareSize, (tileX - camCentreX) * terrain.scaledSquareSize, (-tileY + camCentreY) * terrain.scaledSquareSize, itemID)
                    terrain.decorMap[tileX][tileY].cacheElement(tileX, tileY);
                    socket.emit("new_colour", {x: tileX, y: tileY, colour: itemID, id: socket.id})
                    itemID = -1;
                    changeHotbar();
                } else {
                    if (itemID !== -1 || !sprites[terrain.decorMap[tileX][tileY].itemID].movable) {
                        return;
                    }
                    itemID = terrain.decorMap[tileX][tileY].itemID;
                    changeHotbar();
                    terrain.decorMap[tileX][tileY].changeSprite(-1, tileX, tileY, true);
                }
            } catch (error) {
                console.log(terrain.activeChunks, getChunkID(Math.floor(tileX/32), Math.ceil(tileY/-32)))
                console.log("error:", error)
            }
        }
    }

    // Changes the zoom amount of the canvas.
    setZoom(scaledSquareSize) {
        terrain.scaledSquareSize = scaledSquareSize;
        moveSpeed = terrain.scaledSquareSize / 100;
    }

    fetchKeyPress() {
        let x = 0, y = 0;

        if (keyMap[87]) y = 4; // W
        if (keyMap[65]) x = 4; // A
        if (keyMap[83]) y += -4 // S
        if (keyMap[68]) x += -4 // D
        if (keyMap[16]) {
            x = x * 1.6;
            y = y * 1.6;
        }

        if (keyMap[84]) {
            keyMap[84] = false;
            if (movementLock) {
                hideTownMaker()
                closeColourSelector()
            } else {
                openTownMaker()
            }
        }

        let reload = true;
        if (keyMap[70] && renderer.viewDebugType !== "height") {
            renderer.viewDebugType = "height"
        } else if (keyMap[78] && renderer.viewDebugType !== "normal") {
            renderer.viewDebugType = "normal"
        } else if (keyMap[71] && renderer.viewDebugType !== "warmth") {
            renderer.viewDebugType = "warmth"
        } else if (keyMap[72] && renderer.viewDebugType !== "damp") {
            renderer.viewDebugType = "damp"
        } else if (keyMap[74] && renderer.viewDebugType !== "tree") {
            renderer.viewDebugType = "tree"
        } else if (keyMap[75] && renderer.viewDebugType !== "random") {
            renderer.viewDebugType = "random"
        } else {
            reload = false;
        }

        if (reload) {
            terrain.loadStartingChunks(camCentreX, camCentreY)
        }

        return {x, y};
    }

    // @TODO add in actual stopping from placing on the ocean floor.
    placingOnOcean(tileX, tileY) {
        const chunkID = getChunkID(Math.floor(tileX/32), Math.ceil(-tileY/-32));
        const colour = terrain.activeChunks[chunkID].chunk.chunkMap[tileX][-tileY].colour;
        return colour === "#73bed3" || colour === "#4f8fba" || colour === "#3c5e8b";
    }

    selectTile() {
        try {
            return terrain.terrainMap
                [Math.floor(mouseX/terrain.scaledSquareSize)]
                [Math.floor(mouseY/terrain.scaledSquareSize)];
        } catch (error) {
            return null;
        }
    }

    keyDownProcessor(event) {

        if (document.activeElement !== document.body) return;

        var event = window.event || event;
        if (event.keyCode === 37 || event.keyCode === 39 || event.keyCode === 84) return;
        keyMap[event.keyCode] = true;
    }

    keyUpProcessor(event) {

        if (document.activeElement !== document.body) return;

        var event = window.event || event;
        if (event.keyCode === 37 || event.keyCode === 39 || event.keyCode === 84) {
            keyMap[event.keyCode] = true;
            return;
        }
        keyMap[event.keyCode] = false;
    }

    onMouseMove(event) {
        const oldTileX = Math.floor(mouseX/terrain.scaledSquareSize);
        mouseX = ((event.clientX / window.innerWidth) * 1920) + (camCentreX*terrain.scaledSquareSize) - windowWidth / 2;
        const oldTileY = Math.floor(mouseY/terrain.scaledSquareSize);
        mouseY = (event.clientY / renderer.gameHeight) * renderer.verticalZoomLevel - (camCentreY*terrain.scaledSquareSize) - windowHeight / 2;
        if (oldTileX !== Math.floor(mouseX/terrain.scaledSquareSize) || oldTileY !== Math.floor(mouseY/terrain.scaledSquareSize)) {
            if (keyMap["mouse_L"] || keyMap["mouse_R"]) {
                draw = true;
            }

            // Graying out the selector if the player is unable to place or pick up in this tile.
            Math.abs(Math.floor(camCentreX + 0.5) - Math.floor(mouseX / terrain.scaledSquareSize)) > 1
                || Math.abs(Math.floor(camCentreY + 0.5) + Math.floor(mouseY / terrain.scaledSquareSize)) > 1 ?
                renderer.uiMap["selector"].opacity = 0.2 : renderer.uiMap["selector"].opacity = 1;
        }
    }

    onMouseDown(event) {
        if (event.which === 3 || event.button === 2) {
            keyMap["mouse_R"] = true;
        } else {
            keyMap["mouse_L"] = true;
        }
        draw = true;
        if (!movementLock) event.preventDefault();
    }

    onMouseUp(event) {
        keyMap["mouse_R"] = false;
        keyMap["mouse_L"] = false;
    }

    clearKeyMap() {
        this.keyMap = {};
    }
}

function toggleColourSelector() {
    if (document.getElementById("colour-menu").style.display === "block") {
        document.getElementById("colour-menu").style.display = "none";
        document.getElementById("colour-menu-background").style.display = "none";
        document.getElementById("colour-menu-container").style.zIndex = "-1";
    } else {
        document.getElementById("colour-menu").style.display = "block";
        document.getElementById("colour-menu-background").style.display = "block";
        document.getElementById("colour-menu-container").style.zIndex = "2";
    }

    document.getElementById("town-colour").checked = true;
    return false;
}

function closeColourSelector() {
    document.getElementById("colour-menu").style.display = "none";
    document.getElementById("colour-menu-background").style.display = "none";
    document.getElementById("colour-menu-container").style.zIndex = "-1";
    return false;
}

townColours = [
    "#ff5555", "#ffaa22", "#ddbb99", "#aaff55",
    "#33ddff", "#ff66bb", "#889999", "#223344"
]

let chosenColour = -1;

function selectColour(colour) {
    document.documentElement.style.setProperty('--town-colour', `solid-colour-${colour} 20s ease alternate infinite`);
    closeColourSelector()
    chosenColour = colour;
}

function createTown() {
    document.getElementById("town-name-error").style.visibility = "hidden"
    document.getElementById("town-description-error").style.visibility = "hidden"
    document.getElementById("town-invitecode-error").style.visibility = "hidden"
    document.getElementById("town-colour-error").style.visibility = "hidden"

    const town_name = document.getElementById("town-name").value;
    // Is the town name present
    if (town_name === "") {
        document.getElementById("town-name-error").style.visibility = "visible"
        document.getElementById("town-name-error").innerHTML = "You need to specify a town name.";
        return false;
    // Is the town name between 4-32 characters.
    } else if (town_name.length > 32 || town_name.length < 4) {
        document.getElementById("town-name-error").style.visibility = "visible"
        document.getElementById("town-name-error").innerHTML = "Town name must be between 4-32 characters.";
        return false;
    // Does the town name only contain characters you'd expect?
    } else if (!(/^[a-zA-Z0-9 ]+$/.test(town_name))) {
        document.getElementById("town-name-error").style.visibility = "visible"
        document.getElementById("town-name-error").innerHTML = "Town name can only contain a-Z, 0-9, and spaces.";
        return false;
    }

    const town_description = document.getElementById("town-description").value;

    const invite_only = document.getElementById("town-invite-only").checked;

    const invite_code = document.getElementById("town-invitecode").value;
    if (invite_code === "" || invite_code.length > 32) {
        document.getElementById("town-invitecode-error").style.visibility = "visible"
        document.getElementById("town-invitecode-error").innerHTML = "This section must be between 0 and 32 characters.";
        return false;
    }

    if (chosenColour === -1) {
        document.getElementById("town-colour-error").style.visibility = "visible"
        document.getElementById("town-colour-error").innerHTML = "You need to specify a colour for your town to represent.";
        return false;
    }

    postTownCreationData(town_name, town_description, invite_only, invite_code, chosenColour);
}