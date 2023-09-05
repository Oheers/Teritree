randomColours = [
    "#efffef",
    "#ccffcc",
    "#ccffff"
]

let windowWidth = 0;
let windowHeight = 0;

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
        ctx.fillRect(this.x + windowWidth / 2, this.y + windowHeight / 2, this.width, this.height);
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

class Chunk {

    chunkX;
    chunkY;
    chunkMap = {};

    constructor(_chunkX, _chunkY) {
        this.chunkX = _chunkX;
        this.chunkY = _chunkY;
    }

    populate(squareSize) {
        for (let x=0; x < 32; x++) {
            const vertical = {};
            for (let y=0; y > -32; y--) {
                vertical[(this.chunkY*32) + y] = (new BackgroundElement(squareSize, squareSize + Math.random(), randomColours[getRandomNumber(0, 2)], ((this.chunkX*32) + x)*squareSize, ((this.chunkY*32) + y)*squareSize));
            }
            this.chunkMap[(this.chunkX*32) + x] = vertical;
        }
    }

    loadInMem(liveMap) {
        for (const rowKey in this.chunkMap) {
            if (this.chunkMap.hasOwnProperty(rowKey)) {
                const row = this.chunkMap[rowKey];

                // Check if the corresponding row exists in liveMap, create if not
                if (!liveMap.hasOwnProperty(rowKey)) {
                    liveMap[rowKey] = {};
                }

                // Loop through the columns of chunkMap
                for (const colKey in row) {
                    if (row.hasOwnProperty(colKey)) {
                        liveMap[rowKey][colKey] = this.chunkMap[rowKey][colKey];
                    }
                }
            }
        }
    }

    unloadInMem(liveMap) {
        for (const rowKey in this.chunkMap) {
            if (this.chunkMap.hasOwnProperty(rowKey) && liveMap.hasOwnProperty(rowKey)) {
                const chunkRow = this.chunkMap[rowKey];
                const liveRow = liveMap[rowKey];

                // Loop through the columns of chunkRow
                for (const colKey in chunkRow) {
                    if (chunkRow.hasOwnProperty(colKey) && liveRow.hasOwnProperty(colKey)) {
                        // Remove the entry from liveRow if it exists in chunkRow
                        delete liveRow[colKey];
                    }
                }

                // If liveRow is empty after removing entries, delete the entire row
                if (Object.keys(liveRow).length === 0) {
                    delete liveMap[rowKey];
                }
            }
        }
    }
}

class TerrainGenerator {

    _scaledSquareSize = 0;
    terrainMap = {}

    constructor(_windowWidth, _windowHeight) {
        windowWidth = _windowWidth;
        windowHeight = _windowHeight;
        this._scaledSquareSize = _windowWidth / 20;
    }

    fetchChunk(x, y) {
        const newChunk = new Chunk(x, y);
        newChunk.populate(this._scaledSquareSize);
        newChunk.loadInMem(this.terrainMap);
    }

    /**
     * Loads chunks around the player when they first log in.
     *
     * @param x Player x coordinate
     * @param y Player y coordinate
     */
    loadStartingChunks(x, y) {
        const currentRenderRegion = this.findRenderRegion(x, y);
        this.fetchChunk((currentRenderRegion.x - 1), (currentRenderRegion.y + 1));
        this.fetchChunk((currentRenderRegion.x), (currentRenderRegion.y + 1));
        this.fetchChunk((currentRenderRegion.x -1), (currentRenderRegion.y));
        this.fetchChunk(currentRenderRegion.x, currentRenderRegion.y);
    }

    fetchLocalTerrain(newX, newY, oldX, oldY) {
        const newRenderRegion = this.findRenderRegion(newX, newY);
        const oldRenderRegion = this.findRenderRegion(oldX, oldY);

        if (newRenderRegion.x === oldRenderRegion.x && newRenderRegion.y === oldRenderRegion.y) {
            return;
        }

        // Player has moved EAST into a new render region
        if (newRenderRegion.x > oldRenderRegion.x) {

        }
    }

    updateAll() {
        for (const rowKey in this.terrainMap) {
            if (this.terrainMap.hasOwnProperty(rowKey)) {
                const row = this.terrainMap[rowKey];
                for (const colKey in row) {
                    if (row.hasOwnProperty(colKey)) {
                        row[colKey].update();
                    }
                }
            }
        }
    }

    findRenderRegion(x, y) {
       return {
           x: Math.floor((x + 32) / 64),
           y: Math.ceil((y - 32) / 64)
       }
    }

    get terrainMap() {
        return this.terrainMap;
    }

    get scaledSquareSize() {
        return this._scaledSquareSize;
    }
}