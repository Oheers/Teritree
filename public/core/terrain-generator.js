let windowWidth = 0;
let windowHeight = 0;

class Element {

    constructor(_width, _height, _x, _y) {
        this.width = _width;
        this.height = _height;
        this.x = _x;
        this.y = _y;
        this.subElements = []
    }

    update() {
        this.ctx = renderer.viewportArea.context;
        this.ctx.fillRect(this.x + windowWidth / 2, this.y + windowHeight / 2, this.width + 1, this.height + 1);
        this.subElements.forEach(function (element) {
            element.update();
        })
    }

    translate(x, y) {
        this.x += x;
        this.y += y;
        this.subElements.forEach(function (element) {
            element.translate(x, y);
        })
    }

    addSubElement(element) {
        this.subElements.push(element);
    }

    get getX() {
        return this.x;
    }

    get getY() {
        return this.y;
    }
}

class UiElementStroke extends Element {

    constructor(_width, _height, _x, _y, _colour, _thickness) {
        super(_width, _height, _x, _y);
        this.colour = _colour;
        this.thickness = _thickness;
        this.ctx = renderer.viewportArea.context;
    }

    update() {
        this.ctx.lineWidth = this.thickness
        this.ctx.strokeStyle = this.colour;
        this.ctx.strokeRect(this.x + windowWidth / 2, this.y + windowHeight / 2, this.width + 1, this.height + 1);
    }

    setColour(colourID) {
        this.colour = colours[colourID - 1].colour
    }

    changeTile(tileX, tileY) {
        this.x = tileX;
        this.y = tileY;
    }
}

class SpriteElement extends Element {

    /**
     * Creates a new sprite element for the second layer.
     * @param _width The width of the sprite, usually 16.
     * @param _height The height of the sprite, usually 16.
     * @param _x The x coordinate of the position it should be rendered on the screen.
     * @param _y The y coordinate of the position it should be rendered on the screen.
     * @param _itemID The itemID relevant to the sprite.
     */
    constructor(_width, _height, _x, _y, _itemID) {
        const allocatedItem = sprites[_itemID];
        const x = _x + ((Math.random() * (allocatedItem.tRight + allocatedItem.tLeft) - allocatedItem.tLeft) * (100 / PIXELS_WIDTH));
        const y = _y + ((Math.random() * (allocatedItem.tDown - allocatedItem.tUp) + allocatedItem.tDown) * (100 / PIXELS_WIDTH));
        super(_width, _height, x, y);
        this.sx = allocatedItem.sx;
        this.sy = allocatedItem.sy;
        this.itemID = _itemID;
        this.img = document.getElementById("sprites");
    }

    update() {
        this.ctx = renderer.viewportArea.context;
        this.ctx.drawImage(this.img, this.sx, this.sy, PIXELS_WIDTH, PIXELS_HEIGHT, this.x + windowWidth / 2, this.y + windowHeight / 2, this.width, this.height)
    }

    setItem(itemID) {
        this.itemID = itemID;
        const allocatedItem = sprites[itemID];
        this.sx = allocatedItem.sx;
        this.sy = allocatedItem.sy;
    }

    changeSprite(itemID, emitToSocket) {
        this.setItem(itemID);

        const realX = Math.floor(mouseX/terrain.scaledSquareSize)
        const realY = Math.floor(mouseY/terrain.scaledSquareSize)

        this.cacheElement(realX, realY);
        if (emitToSocket) socket.emit("new_colour", {x: realX, y: realY, colour: this.itemID, id: socket.id})
    }

    // Adds a tile to the update maps, to be cached in localStorage.
    cacheElement(realX, realY) {
        const updateMap = terrain.activeChunks[getChunkID(Math.floor(realX/32), Math.ceil(realY/-32))].chunk.updateMap;
        const tileID = ((4493 - realY) * 9984) + (realX + 4492)
        for (let i = 0; i < updateMap.length; i++) {
            if (updateMap[i].tileID === tileID) {
                updateMap[i] = {
                    tileID: tileID,
                    itemID: this.itemID
                }
                return;
            }
        }

        updateMap.push({
            tileID: tileID,
            itemID: this.itemID
        })
    }
}

class UiElementSprite extends SpriteElement {

    constructor(_width, _height, _x, _y, _itemID) {
        super(_width, _height, _x, _y, _itemID);
    }

    changeTile(tileX, tileY) {
        this.x = tileX;
        this.y = tileY;
    }
}

class StaticUiElementSprite extends SpriteElement {

    constructor(_width, _height, _x, _y, _itemID) {
        super(_width, _height, _x, _y, _itemID);
        this.ctx = renderer.viewportArea.context;
    }

    translate(x, y) {
        // Do nothing
    }

    update() {
        this.ctx.drawImage(this.img, this.sx, this.sy, PIXELS_WIDTH, PIXELS_HEIGHT, this.x, this.y, this.width, this.height)
    }
}

class BackgroundElement extends Element {
    constructor(width, height, colour, opacity, x, y) {
        super(width, height, x, y);
        this._colour = colour;
        this._opacity = opacity;
        this.ctx = renderer.viewportArea.context;
    }

    update() {
        this.ctx.fillStyle = this.colour;
        this.ctx.globalAlpha = this._opacity;
        this.ctx.fillRect(this.x + windowWidth / 2, this.y + windowHeight / 2, this.width + 1, this.height + 1);
        this.ctx.globalAlpha = 1;
    }

    changeColour(colour) {
        this.colour = colour;
    }

    get colour() {
        return this._colour;
    }


    get opacity() {
        return this._opacity;
    }
}

class TextElement extends Element {
    constructor(width, height, x, y, text, font, textAlign, colour) {
        super(width, height, x, y);
        this._text = text;
        this._font = font;
        this._colour = colour;
        this.ctx = renderer.viewportArea.context;
    }

    update() {
        this.ctx.font = this._font;
        this.ctx.fillStyle = this._colour
        this.ctx.textAlign = "center";
        this.ctx.fillText(this._text, this.x + windowWidth / 2, this.y + windowHeight / 2);
    }

    get textWidth() {
        return this.ctx.measureText(this._text).width
    }

    set text(text) {
        this._text = text;
    }

    set font(font) {
        this._font = font;
    }
}

class StaticUiBackgroundElement extends BackgroundElement {

    constructor(_width, _height, _colour, _opacity, _x, _y) {
        super(_width, _height, _opacity, _x, _y);
        this.colour = _colour;
    }

    translate(x, y) {
        // Do nothing
    }

    update() {
        this.ctx = renderer.viewportArea.context;
        this.ctx.drawImage(this.img, this.sx, this.sy, PIXELS_WIDTH, PIXELS_HEIGHT, this.x, this.y, this.width, this.height)
    }
}

class PlayerElement extends Element {
    constructor(x, y, character) {
        super(PLAYER_WIDTH, PLAYER_WIDTH, x, y);
        this.character = character;
        this.facing = 2; // 0 = south, 1 = north, 2 = east, 3 = west
        this.img = document.getElementById("character_sprites");
        this.sx = 0
        this.sy = character * PIXELS_HEIGHT

        this.moved = false;
        this.movedAgain = false;
        this.leg = 0;
    }

    update() {
        this.ctx = renderer.viewportArea.context;
        this.ctx.drawImage(this.img, this.sx, this.sy, PIXELS_WIDTH, PIXELS_HEIGHT, this.x + windowWidth / 2, this.y + windowHeight / 2, this.width, this.height)
        this.subElements.forEach(function (element) {
            element.update();
        })
    }

    move(x, y) {
        this.x += x;
        this.y += y;
        this.calculateDirection(x, y)
        this.startAnimation();
        this.subElements.forEach(function (element) {
            element.translate(x, y);
        })
    }

    startAnimation() {
        if (!this.moved) {
            this.moved = true;
            this.leg = 1;
            setTimeout(() => this.recheckMove(), 400);
        } else {
            this.movedAgain = true;
        }
    }

    recheckMove = async () => {
        if (this.movedAgain) {
            this.movedAgain = false;
            this.leg === 1 ? this.leg = 3 : this.leg = 1;
            setTimeout(() => this.recheckMove(), 400);
        } else {
            this.leg = 0;
            this.moved = false;
            this.sx = ((this.facing * 5) + this.leg) * PIXELS_WIDTH;
        }
    };

    calculateDirection(x, y) {
        if (y === 0) {
            if (x === 0) return;
            else if (x > 0) {
                this.facing = 2;
            } else {
                this.facing = 3;
            }
        } else {
            if (y < 0) {
                this.facing = 1;
            } else {
                this.facing = 0;
            }
        }

        this.sx = ((this.facing * 5) + this.leg) * PIXELS_WIDTH;
    }
}


class Chunk {

    chunkX;
    chunkY;
    chunkMap = {};
    updateMap = [];
    chunkDecor = {};
    saveTime = 0;

    constructor(_chunkX, _chunkY) {
        this.chunkX = _chunkX;
        this.chunkY = _chunkY;
    }

    populate(squareSize) {
        for (let x=0; x < 32; x++) {
            const vertical = {};
            for (let y=0; y < 32; y++) {
                let tileX = (((32*this.chunkX) + x) + 4492);
                let tileY = (((32*this.chunkY) - y) + 4492);

                let colour = ""
                let tree = -1;
                let shrub = -1;

                colour = standardColourRendering(tileX, tileY);
                tree = shouldPlaceTree(tileX, tileY, colour)
                shrub = shouldPlaceShrubbery(tileX, tileY, colour)
                vertical[y - (this.chunkY*32)] = (new BackgroundElement(squareSize, squareSize, colour, 1, squareSize * ((32*this.chunkX) + x - camCentreX), squareSize * ((y - (this.chunkY*32)) + camCentreY)));
                tileX -= 4492;
                tileY -= 4492;
                if (tree !== -1) {
                    this.chunkDecor[tileX] ??= {}
                    this.chunkDecor[tileX][tileY] ??= new SpriteElement(terrain.scaledSquareSize, terrain.scaledSquareSize, squareSize * ((32*this.chunkX) + x - camCentreX), squareSize * ((y - (this.chunkY*32)) + camCentreY), tree)
                } else if (shrub !== -1) {
                    this.chunkDecor[tileX] ??= {}
                    this.chunkDecor[tileX][tileY] ??= new SpriteElement(terrain.scaledSquareSize, terrain.scaledSquareSize, squareSize * ((32*this.chunkX) + x - camCentreX), squareSize * ((y - (this.chunkY*32)) + camCentreY), shrub)
                }
            }
            this.chunkMap[(this.chunkX*32) + x] = vertical;
        }
        const chunk = fetchCache(this.chunkX, this.chunkY)
        this.updateMap = chunk.map
        this.saveTime = chunk.saveTime;
    }

    loadInMem(liveMap, decorMap) {
        this.unwrapMap(this.chunkMap, liveMap)
        this.unwrapMap(this.chunkDecor, decorMap)

        for (const i in this.updateMap) {
            const update = this.updateMap[i]
            const uX = (update.tileID % 9984) - 4492
            const uY = Math.floor(-update.tileID / 9984) + 4494

            decorMap[uX] ??= {}
            const xRow = decorMap[uX]

            // Creates new decoration on the map.
            if (xRow[-uY] === undefined) {
                const correspondingTile = liveMap[uX][uY]
                decorMap[uX][-uY] = new SpriteElement(terrain.scaledSquareSize, terrain.scaledSquareSize, correspondingTile.x, correspondingTile.y, update.itemID)
            } else {
                decorMap[uX][-uY].setItem(update.itemID)
            }
        }
    }

    unwrapMap(wrappedMap, outMap) {
        for (const rowKey in wrappedMap) {
            if (wrappedMap.hasOwnProperty(rowKey)) {
                const row = wrappedMap[rowKey];

                // Check if the corresponding row exists in liveMap, create if not
                if (!outMap.hasOwnProperty(rowKey)) {
                    outMap[rowKey] = {};
                }

                // Loop through the columns of chunkMap
                for (const colKey in row) {
                    if (row.hasOwnProperty(colKey)) {
                        outMap[rowKey][colKey] = wrappedMap[rowKey][colKey];
                    }
                }
            }
        }
    }

    unloadBackground() {
        for (const rowKey in this.chunkMap) {
            if (this.chunkMap.hasOwnProperty(rowKey) && terrain.terrainMap.hasOwnProperty(rowKey)) {
                const chunkRow = this.chunkMap[rowKey];
                const liveRow = terrain.terrainMap[rowKey];

                // Loop through the columns of chunkRow
                for (const colKey in chunkRow) {
                    if (chunkRow.hasOwnProperty(colKey) && liveRow.hasOwnProperty(colKey)) {
                        // Remove the entry from liveRow if it exists in chunkRow
                        delete liveRow[colKey];
                    }
                }

                // If liveRow is empty after removing entries, delete the entire row
                if (Object.keys(liveRow).length === 0) {
                    delete terrain.terrainMap[rowKey];
                }
            }
        }
    }

    unloadDecor(cache) {
        if (cache) cacheChunk(this.chunkX, this.chunkY, this.updateMap, Date.now() + 86400000)
        for (const rowKey in this.chunkDecor) {
            if (this.chunkDecor.hasOwnProperty(rowKey) && terrain.decorMap.hasOwnProperty(rowKey)) {
                const chunkRow = this.chunkDecor[rowKey];
                const liveRow = terrain.decorMap[rowKey];

                // Loop through the columns of chunkRow
                for (const colKey in chunkRow) {
                    if (chunkRow.hasOwnProperty(colKey) && liveRow.hasOwnProperty(colKey)) {
                        // Remove the entry from liveRow if it exists in chunkRow
                        delete liveRow[colKey];
                    }
                }

                // If liveRow is empty after removing entries, delete the entire row
                if (Object.keys(liveRow).length === 0) {
                    delete terrain.decorMap[rowKey];
                }
            }
        }
    }
}

class TerrainGenerator {

    scaledSquareSize = 0;

    terrainMap = {}
    decorMap = {};
    activeChunks = {}
    players = {}

    restingQueue = []

    lastWorldReset = 0;
    seed = -1;

    constructor(_windowWidth, _windowHeight) {
        windowWidth = _windowWidth;
        windowHeight = _windowHeight;
        this.scaledSquareSize = 100;
    }

    fetchChunk(x, y) {
        const newChunk = new Chunk(x, y);
        newChunk.populate(this.scaledSquareSize);
        newChunk.loadInMem(this.terrainMap, this.decorMap);
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
        const y = Math.floor(tileID / 9984) - 4493

        // Actioning the colour changing
        terrain.decorMap[x] ??= {}
        if (terrain.decorMap[x][y] === undefined) {
            const correspondingTile = terrain.terrainMap[x][-y]
            terrain.decorMap[x][y] = new SpriteElement(terrain.scaledSquareSize, terrain.scaledSquareSize, correspondingTile.x, correspondingTile.y, itemID)
        } else {
            terrain.decorMap[x][y].changeSprite(itemID, false);
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
                    const chunk = this.activeChunks[chunkID];
                    chunk.chunk.unloadDecor(true) // Unloads sprite tiles from memory.
                    chunk.chunk.unloadBackground() // Unloads background tiles from memory.
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
                    const chunk = this.activeChunks[chunkID];
                    chunk.chunk.unloadDecor(true) // Unloads sprite tiles from memory.
                    chunk.chunk.unloadBackground() // Unloads background tiles from memory.
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
                    const chunk = this.activeChunks[chunkID];
                    chunk.chunk.unloadDecor(true) // Unloads sprite tiles from memory.
                    chunk.chunk.unloadBackground() // Unloads background tiles from memory.
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
                    const chunk = this.activeChunks[chunkID];
                    chunk.chunk.unloadDecor(true) // Unloads sprite tiles from memory.
                    chunk.chunk.unloadBackground() // Unloads background tiles from memory
                    delete this.activeChunks[chunkID]; // Remove the chunk
                }
            }
        }
    }

    addNewPlayer(playerID, self, x, y, displayName, character) {
        const element = new PlayerElement(x, y, character)
        const text = new TextElement(200, 50, x + (PLAYER_WIDTH / 2), y - 12.5, playerID, "24px Arial", "center", "black")
        const width = text.textWidth * 2.5 + 12
        element.addSubElement(text)
        element.addSubElement(new BackgroundElement(width, 35, "black", 0.2, x + (PLAYER_WIDTH / 2) - (width / 2), y - 38.75))
        this.players[playerID] = {
            x: x,
            y: y,
            self: self,
            displayName: displayName,
            colour: character,
            element: element
        }
    }

    removePlayer(playerID) {
        delete this.players[playerID];
    }

    updateAll(map) {
        for (const rowKey in map) {
            if (map.hasOwnProperty(rowKey)) {
                const row = map[rowKey];
                for (const colKey in row) {
                    if (row.hasOwnProperty(colKey)) {
                        row[colKey].update();
                    }
                }
            }
        }
    }

    updateAllUI(map) {
        for (const element in map) {
            map[element].update();
        }
    }

    updateAllPlayers() {
        for (const playerID in this.players) {
            this.players[playerID].element.update();
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