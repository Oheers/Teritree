let camCentreX = 0;
let camCentreY = 0;
let mouseX = 0;
let mouseY = 0;
let keyMap = {};

class InputHandler {

    constructor() {
        console.log(this.keyMap);
        window.addEventListener('keydown', this.keyDownProcessor, false)
        window.addEventListener('keyup', this.keyUpProcessor, false)
        window.addEventListener("mousemove", this.onMouseMove, false);
        window.addEventListener("mousedown", this.onMouseDown, false);
        window.addEventListener("mouseup", this.onMouseUp, false);
    }

    tick(timeDiff) {
        if (!renderer.isFocus) return;
        this.fetchMousePress();
        const keyResult = this.fetchKeyPress();
        keyResult.x *= (timeDiff / 50);
        keyResult.y *= (timeDiff / 50);
        const x = keyResult.x;
        const y = keyResult.y;
        this.updatePositioning(x, y);
        lastUpdated = Date.now();
    }

    updatePositioning(x, y) {
        camCentreX += (-(x / terrain.scaledSquareSize));
        camCentreY += (y / terrain.scaledSquareSize);
        mouseX -= (x);
        mouseY -= (y);
        renderer.translate(x, y);
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
        mouseX = event.clientX + (camCentreX*terrain.scaledSquareSize);
        mouseY = event.clientY - (camCentreY*terrain.scaledSquareSize);
        console.log(event.clientX, camCentreX, terrain.scaledSquareSize);
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