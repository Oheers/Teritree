let camCentreX = 0;
let camCentreY = 0;
let mouseX = 0;
let mouseY = 0;
let draw = false;
let keyMap = {};
let moveSpeed = 1.8 // default = 1

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

    fetchMousePress() {
        if (draw) {
            const tileX = Math.floor(mouseX / terrain.scaledSquareSize);
            const tileY = Math.floor(mouseY / terrain.scaledSquareSize);
            try {
                terrain.terrainMap[tileX][tileY].highlight(keyMap["mouse_L"]);
            } catch (error) {

            }
            draw = false;
        }
    }

    fetchKeyPress() {
        let x = 0, y = 0;

        if (keyMap[49]) setColor(1);
        else if (keyMap[50]) setColor(2);
        else if (keyMap[51]) setColor(3);
        else if (keyMap[52]) setColor(4);
        else if (keyMap[53]) setColor(5);
        else if (keyMap[54]) setColor(6);
        else if (keyMap[55]) setColor(7);
        else if (keyMap[56]) setColor(8);
        else if (keyMap[57]) setColor(9);
        else if (keyMap[48]) setColor(11);
        else if (keyMap[101]) setColor(11); // The deep purple 5 on the right-side numpad.

        if (keyMap[87]) y = 4; // W
        if (keyMap[65]) x = 4; // A
        if (keyMap[83]) y += -4 // S
        if (keyMap[68]) x += -4 // D
        if (keyMap[16]) {
            x = x * 1.6;
            y = y * 1.6;
        }
        return {x, y};
    }

    highlightTile(_mouseX, _mouseY, clickSide) {
        const tileX = Math.floor(_mouseX / terrain.scaledSquareSize);
        const tileY = Math.floor(_mouseY / terrain.scaledSquareSize);
        try {
            terrain.terrainMap[tileX][tileY].highlight(clickSide);
        } catch (error) {

        }
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
        keyMap[event.keyCode] = true;
    }

    keyUpProcessor(event) {
        var event = window.event || event;
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