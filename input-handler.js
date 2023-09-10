let camCentreX = 0;
let camCentreY = 0;
let mouseX = 0;
let mouseY = 0;
let keyMap = {};
let moveSpeed = 1.5 // default = 1

class InputHandler {

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
        this.updatePositioning(x, y);
        lastUpdated = Date.now();
    }

    updatePositioning(x, y) {
        const oldX = camCentreX;
        const oldY = camCentreY;
        camCentreX += (-(x / terrain.scaledSquareSize));
        camCentreY += (y / terrain.scaledSquareSize);
        mouseX -= (x);
        mouseY -= (y);
        renderer.translate(x, y);
        terrain.fetchLocalTerrain(camCentreX, camCentreY, oldX, oldY);
    }

    fetchKeyPress() {
        let x = 0, y = 0;
        if (keyMap[87]) y = 4; // W
        if (keyMap[65]) x = 4; // A
        if (keyMap[83]) y += -4 // S
        if (keyMap[68]) x += -4 // D
        if (keyMap[16]) {
            x = x * 2;
            y = y * 2;
        }
        return {x, y};
    }

    fetchMousePress() {
        if (keyMap["mouse_L"] || keyMap["mouse_R"]) {
            const tileX = Math.floor(mouseX / terrain.scaledSquareSize);
            const tileY = Math.floor(mouseY / terrain.scaledSquareSize);
            try {
                terrain.terrainMap[tileX][tileY].highlight(keyMap["mouse_L"]);
            } catch (error) {

            }
        }
    }

    selectTile() {
        const tileX = Math.floor(mouseX/terrain.scaledSquareSize);
        const tileY = Math.floor(mouseY/terrain.scaledSquareSize);
        try {
            return terrain.terrainMap[tileX][tileY];
        } catch (error) {
            return null;
        }
    }

    keyDownProcessor(event) {
        var event = window.event || event;
        keyMap[event.keyCode] = true;
    }

    keyUpProcessor(event) {
        var event = window.event || event;
        keyMap[event.keyCode] = false;
    }

    onMouseMove(event) {
        mouseX = ((event.clientX / window.innerWidth) * 1920) + (camCentreX*terrain.scaledSquareSize) - windowWidth / 2;
        mouseY = (event.clientY / renderer.gameHeight) * renderer.verticalZoomLevel - (camCentreY*terrain.scaledSquareSize) - windowHeight / 2;
    }

    onMouseDown(event) {
        if (event.which === 3 || event.button === 2) {
            keyMap["mouse_R"] = true;
        } else {
            keyMap["mouse_L"] = true;
        }
        event.preventDefault();
    }

    onMouseUp() {
        keyMap["mouse_R"] = false;
        keyMap["mouse_L"] = false;
    }

    clearKeyMap() {
        this.keyMap = {};
    }
}