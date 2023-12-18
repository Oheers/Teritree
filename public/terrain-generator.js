let windowWidth = 0;
let windowHeight = 0;

class BackgroundElement {
    constructor(_width, _height, _originalColour, _x, _y) {
        this.width = _width;
        this.height = _height;
        this.baseColour = _originalColour;
        this.currentColour = _originalColour;
        this.colourID = 1;
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
        else this.setColour(item.colorID);

        const realX = Math.floor(mouseX/terrain.scaledSquareSize)
        const realY = Math.floor(mouseY/terrain.scaledSquareSize)

        this.highlighted = !this.highlighted;
        this.cacheElement(realX, realY);
        socket.emit("new_colour", {x: realX, y: realY, colour: this.colourID, id: socket.id})
    }

    setColour(colour) {
        this.currentColour = colors[colour - 1].color
        this.colourID = colour;
    }

    // Adds a tile to the update maps, to be cached in localStorage.
    cacheElement(realX, realY) {
        const updateMap = terrain.activeChunks[getChunkID(Math.floor(realX/32), Math.ceil(realY/-32))].chunk.updateMap;
        const tileID = ((4493 - realY) * 9984) + (realX + 4492)
        for (let i = 0; i < updateMap.length; i++) {

            if (updateMap[i].tileID === tileID) {
                updateMap[i] = {
                    tileID: tileID,
                    itemID: this.colourID
                }
                return;
            }
        }

        updateMap.push({
            tileID: tileID,
            itemID: this.colourID
        })
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
    updateMap = [];
    saveTime = 0;

    constructor(_chunkX, _chunkY) {
        this.chunkX = _chunkX;
        this.chunkY = _chunkY;
    }

    populate(squareSize) {
        for (let x=0; x < 32; x++) {
            const vertical = {};
            for (let y=0; y < 32; y++) {
                vertical[y - (this.chunkY*32)] = (new BackgroundElement(squareSize, squareSize, colors[9].color, squareSize * ((32*this.chunkX) + x - camCentreX), squareSize * ((y - (this.chunkY*32)) + camCentreY)));
            }
            this.chunkMap[(this.chunkX*32) + x] = vertical;
        }
        const chunk = fetchCache(this.chunkX, this.chunkY)
        this.updateMap = chunk.map
        this.saveTime = chunk.saveTime;
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

        for (const i in this.updateMap) {
            const update = this.updateMap[i]
            const uX = (update.tileID % 9984) - 4492
            const uY = Math.floor(-update.tileID / 9984) + 4494

            if (!liveMap.hasOwnProperty(uX)) {
                continue;
            }

            const liveRow = liveMap[uX]

            // Loop through the columns of chunkMap
            if (liveRow.hasOwnProperty(uY)) {
                liveMap[uX][uY].setColour(update.itemID);
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
    restingQueue = []

    constructor(_windowWidth, _windowHeight) {
        windowWidth = _windowWidth;
        windowHeight = _windowHeight;
        this.scaledSquareSize = 100;
    }

    fetchChunk(x, y) {
        const newChunk = new Chunk(x, y);
        newChunk.populate(this.scaledSquareSize);
        newChunk.loadInMem(this.terrainMap);
        const chunkID = getChunkID(x, y)
        this.activeChunks[chunkID] = {
            chunk: newChunk,
            x: x,
            y: y
        }
        const index = this.restingQueue.indexOf(chunkID);
        if (index !== -1) {
            fetchRestingChunk(chunkID, newChunk.saveTime);
            this.restingQueue.splice(index, 1)
        }
    }

    actionRestUpdate(tileID, itemID) {
        // Recovering x and y from compressed tileID form
        const x = (tileID % 9984) - 4492
        const y = 4493 - Math.floor(tileID / 9984)

        // Actioning the colour changing
        const tile = terrain.terrainMap[x][y];
        tile.setColour(itemID)
        tile.cacheElement(x, y);
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