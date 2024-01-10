let camCentreX = 0;
let camCentreY = 0;
let mouseX = 0;
let mouseY = 0;
let draw = false;
let keyMap = {};
let moveSpeed = 4 // default = 1

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
        socket.emit("move", {
            newX: camCentreX,
            newY: camCentreY
        })
    }

    fetchMousePress() {
        if (draw) {
            const tileX = Math.floor(mouseX / terrain.scaledSquareSize);
            const tileY = -Math.floor(mouseY / terrain.scaledSquareSize);
            try {
                terrain.decorMap[tileX] ??= {};
                console.log("fetching mouse press, where tileX:", tileX, "tileY:", tileY)
                if (terrain.decorMap[tileX][tileY] === undefined) {
                    terrain.decorMap[tileX][tileY] = new SpriteElement(terrain.scaledSquareSize, terrain.scaledSquareSize, (tileX - camCentreX) * terrain.scaledSquareSize, (-tileY + camCentreY) * terrain.scaledSquareSize, itemID)
                    terrain.decorMap[tileX][tileY].cacheElement(tileX, tileY);
                    console.log("outbound tile change to:", itemID, "at x:", tileX, "y:", tileY)
                    socket.emit("new_colour", {x: tileX, y: tileY, colour: itemID, id: socket.id})
                } else {
                    terrain.decorMap[tileX][tileY].changeSprite(itemID, tileX, tileY, true);
                }
            } catch (error) {

            }
            draw = false;
        }
    }

    fetchKeyPress() {
        let x = 0, y = 0;

        if (keyMap[39]) {
            increaseItemID()
            keyMap[39] = false;
        }
        else if (keyMap[37]) {
            decreaseItemID();
            keyMap[37] = false;
        }

        if (keyMap[87]) y = 4; // W
        if (keyMap[65]) x = 4; // A
        if (keyMap[83]) y += -4 // S
        if (keyMap[68]) x += -4 // D
        if (keyMap[16]) {
            x = x * 1.6;
            y = y * 1.6;
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