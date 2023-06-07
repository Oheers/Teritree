randomColours = [
    "#efffef",
    "#ccffcc",
    "#ccffff"
]

class BackgroundElement {
    constructor(_width, _height, _originalColour, _x, _y) {
        this.width = _width;
        this.height = _height;
        this.baseColour = _originalColour;
        this.currentColour = _originalColour;
        this.highlighted = false;
        this.x = _x;
        this.y = _y;
    }

    update() {
        const ctx = renderer.viewportArea.context;
        if (activeTile === this) {
            ctx.fillStyle = "red";
        } else {
            ctx.fillStyle = this.currentColour;
        }
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    translate(x, y) {
        this.x += x;
        this.y += y;
    }

    highlight(state) {
        if (!state) {
            this.currentColour = this.baseColour;
        } else {
            this.currentColour = "orange";
        }
        this.highlighted = !this.highlighted;
    }

    get getCurrentColour() {
        return this.currentColour;
    }

    get getX() {
        return this.x;
    }

    get getY() {
        return this.y;
    }
}

class TerrainGenerator {

    windowWidth = 0;
    windowHeight = 0;
    _scaledSquareSize = 0;
    terrainMap = []

    constructor(_windowWidth, _windowHeight) {
        this.windowWidth = _windowWidth;
        this.windowHeight = _windowHeight;
        this._scaledSquareSize = _windowWidth / 20;
        this.compressor = new TerrainCompressor(this.terrainMap, this._scaledSquareSize);
    }

    generate() {
        for (let x=-1; x*this._scaledSquareSize < this.windowWidth+this._scaledSquareSize; x++) {
            const vertical = [];
            for (let y=-1; y*this._scaledSquareSize < this.windowHeight+this._scaledSquareSize; y++) {
                vertical[y] = (new BackgroundElement(this._scaledSquareSize, this._scaledSquareSize, randomColours[Math.floor(Math.random()*3)], x*this._scaledSquareSize, y*this._scaledSquareSize));
            }
            this.terrainMap[x] = vertical;
        }
    }

    updateAll() {
        this.terrainMap.forEach(function(verticalRow) {
            verticalRow.forEach(function(backgroundElement) {
                backgroundElement.update();
            });
        });
        this.compressor.render();
    }

    compress() {
        this.compressor.fetch();
    }

    get terrainMap() {
        return this.terrainMap;
    }

    get scaledSquareSize() {
        return this._scaledSquareSize;
    }
}