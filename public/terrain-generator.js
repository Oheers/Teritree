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
            ctx.fillStyle = item.color;
        } else {
            ctx.fillStyle = this.currentColour;
        }
        ctx.fillRect(this.x + windowWidth / 2, this.y + windowHeight / 2, this.width + 1, this.height + 1);
    }

    translate(x, y) {
        this.x += x;
        this.y += y;
    }

    highlight(state) {
        if (!state) this.setColour(this.baseColour)
        else this.setColour(item.color);

        const realX = Math.floor(mouseX/terrain.scaledSquareSize)
        const realY = Math.floor(mouseY/terrain.scaledSquareSize)

        this.highlighted = !this.highlighted;
        const updateMap = terrain.activeChunks[getChunkID(Math.floor(realX/32), Math.ceil(realY/-32))].chunk.updateMap;
        if (!updateMap.hasOwnProperty(realX)) {
            updateMap[realX] = {};
        }

        updateMap[realX][realY] = {
            colour: this.currentColour
        };
        socket.emit("new_colour", {x: realX, y: realY, id: socket.id})
    }

    setColour(colour) {
        this.currentColour = colour;
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
    updateMap = {};

    constructor(_chunkX, _chunkY) {
        this.chunkX = _chunkX;
        this.chunkY = _chunkY;
    }

    populate(squareSize) {
        for (let x=0; x < 32; x++) {
            const vertical = {};
            for (let y=0; y < 32; y++) {
                vertical[y - (this.chunkY*32)] = (new BackgroundElement(squareSize, squareSize, randomColours[getRandomNumber(0, 2)], squareSize * ((32*this.chunkX) + x - camCentreX), squareSize * ((y - (this.chunkY*32)) + camCentreY)));
            }
            this.chunkMap[(this.chunkX*32) + x] = vertical;
        }
        this.updateMap = fetchCache(this.chunkX, this.chunkY);
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

        for (const rowKey in this.updateMap) {
            if (this.updateMap.hasOwnProperty(rowKey)) {
                const updateRow = this.updateMap[rowKey];

                // Check if the corresponding row exists in liveMap, continues to the next if not
                if (!liveMap.hasOwnProperty(rowKey)) {
                    continue;
                }

                const liveRow = liveMap[rowKey]

                // Loop through the columns of chunkMap
                for (const colKey in updateRow) {
                    if (updateRow.hasOwnProperty(colKey) && liveRow.hasOwnProperty(colKey)) {
                        liveMap[rowKey][colKey].setColour(this.updateMap[rowKey][colKey].colour);
                    }
                }
            }
        }
    }

    unloadInMem(liveMap) {
        cacheChunk(this.chunkX, this.chunkY, this.updateMap, Date.now() + 86400000)
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

    scaledSquareSize = 0;
    terrainMap = {}
    activeChunks = {}

    constructor(_windowWidth, _windowHeight) {
        windowWidth = _windowWidth;
        windowHeight = _windowHeight;
        this.scaledSquareSize = 100;
    }

    fetchChunk(x, y) {
        const newChunk = new Chunk(x, y);
        newChunk.populate(this.scaledSquareSize);
        newChunk.loadInMem(this.terrainMap);
        this.activeChunks[getChunkID(x, y)] = {
            chunk: newChunk,
            x: x,
            y: y
        }
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

        if (newRenderRegion.x === oldRenderRegion.x) {} // Stopping the else statement triggering if moving up/down
        else if (newRenderRegion.x > oldRenderRegion.x) {
            // Player has moved EAST into a new render region
            this.fetchChunk(newRenderRegion.x, newRenderRegion.y);
            this.fetchChunk(newRenderRegion.x, newRenderRegion.y + 1);
            for (const chunkID in this.activeChunks) {
                // Check if the current item meets the criteria, e.g., equal to 3
                if (this.activeChunks.hasOwnProperty(chunkID) && this.activeChunks[chunkID].x === newRenderRegion.x - 2) {
                    this.activeChunks[chunkID].chunk.unloadInMem(this.terrainMap) // Unloads tiles from memory.
                    delete this.activeChunks[chunkID]; // Remove the chunk
                }
            }
        } else {
            // Player has moved WEST into a new render region
            this.fetchChunk(newRenderRegion.x - 1, newRenderRegion.y);
            this.fetchChunk(newRenderRegion.x - 1, newRenderRegion.y + 1);
            for (const chunkID in this.activeChunks) {
                // Check if the current item meets the criteria, e.g., equal to 3
                if (this.activeChunks.hasOwnProperty(chunkID) && this.activeChunks[chunkID].x === newRenderRegion.x + 1) {
                    this.activeChunks[chunkID].chunk.unloadInMem(this.terrainMap) // Unloads tiles from memory.
                    delete this.activeChunks[chunkID]; // Remove the chunk
                }
            }
        }

        if (newRenderRegion.y === oldRenderRegion.y) {} // Stopping the else statement triggering if moving up/down
        else if (newRenderRegion.y > oldRenderRegion.y) {
            // Player has moved NORTH into a new render region
            this.fetchChunk(newRenderRegion.x - 1, newRenderRegion.y + 1);
            this.fetchChunk(newRenderRegion.x, newRenderRegion.y + 1);
            for (const chunkID in this.activeChunks) {
                // Check if the current item meets the criteria, e.g., equal to 3
                if (this.activeChunks.hasOwnProperty(chunkID) && this.activeChunks[chunkID].y === newRenderRegion.y - 1) {
                    this.activeChunks[chunkID].chunk.unloadInMem(this.terrainMap) // Unloads tiles from memory.
                    delete this.activeChunks[chunkID]; // Remove the chunk
                }
            }
        } else {
            // Player has moved SOUTH into a new render region
            this.fetchChunk(newRenderRegion.x, newRenderRegion.y);
            this.fetchChunk(newRenderRegion.x - 1, newRenderRegion.y);
            for (const chunkID in this.activeChunks) {
                // Check if the current item meets the criteria, e.g., equal to 3
                if (this.activeChunks.hasOwnProperty(chunkID) && this.activeChunks[chunkID].y === newRenderRegion.y + 2) {
                    this.activeChunks[chunkID].chunk.unloadInMem(this.terrainMap) // Unloads tiles from memory.
                    delete this.activeChunks[chunkID]; // Remove the chunk
                }
            }
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
           x: Math.floor((x + 16) / 32),
           y: Math.ceil((y - 16) / 32)
       }
    }

    cache() {
        for (const chunkID in this.activeChunks) {
            // Check if the current item meets the criteria, e.g., equal to 3
            if (this.activeChunks.hasOwnProperty(chunkID)) {
                const chunk = this.activeChunks[chunkID];
                cacheChunk(chunk.chunk.chunkX, chunk.chunk.chunkY, chunk.chunk.updateMap, Date.now())
            }
        }
    }

    get terrainMap() {
        return this.terrainMap;
    }

    get scaledSquareSize() {
        return this.scaledSquareSize;
    }
}