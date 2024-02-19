let camCentreX = 0;
let camCentreY = 0;
let mouseX = 0;
let mouseY = 0;
let draw = false;
let keyMap = {};
let moveSpeed = 4

class InputManager {

    constructor() {
        window.addEventListener('keydown', this.keyDownProcessor, false)
        window.addEventListener('keyup', this.keyUpProcessor, false)
        window.addEventListener("mousemove", this.onMouseMove, false);
        window.addEventListener("mousedown", this.onMouseDown, false);
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
        const oldX = camCentreX;
        const oldY = camCentreY;
        if (Math.abs(camCentreX + x) > 20) {
            //x = (Math.abs(camCentreX - (-20)) < Math.abs(camCentreX - 20)) ? camCentreX - 20 : camCentreX + 20;
        }
        if (Math.abs(camCentreY + y) > 20) {
            //y = (Math.abs(camCentreY - (-20)) < Math.abs(camCentreY - 20)) ? camCentreY + 20 : camCentreY - 20;
        }
        camCentreX += (-(x / terrain.scaledSquareSize));
        camCentreY += (y / terrain.scaledSquareSize);
        mouseX -= (x);
        mouseY -= (y);
        renderer.translate(x, y, terrain.terrainMap);
        renderer.translate(x, y, terrain.decorMap);
        renderer.translateUI(x, y, renderer.uiMap);
        renderer.translatePlayers(x, y);
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
                if (terrain.decorMap[tileX][tileY] === undefined || terrain.decorMap[tileX][tileY].itemID === -1) {
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

        let reload = true;
        if (keyMap[70]) {
            this.setZoom(80)
        } else if (keyMap[78]) {
            this.setZoom(60)
        } else if (keyMap[71]) {
            this.setZoom(40)
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
        var event = window.event || event;
        if (event.keyCode === 37 || event.keyCode === 39) return;
        keyMap[event.keyCode] = true;
    }

    keyUpProcessor(event) {
        var event = window.event || event;
        if (event.keyCode === 37 || event.keyCode === 39) {
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
        event.preventDefault();
    }

    onMouseUp(event) {
        keyMap["mouse_R"] = false;
        keyMap["mouse_L"] = false;
    }

    clearKeyMap() {
        this.keyMap = {};
    }
}