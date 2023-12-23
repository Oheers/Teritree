const renderer = new RenderEngine();
const viewport = renderer.viewport;
const terrain = new TerrainGenerator(1920, 1080);
const inputHandler = new InputManager();

const WORLD_SEED = 526;

const socket = io();

let lastUpdated = Date.now();

const coordinateTracker = document.getElementById("location-preview");
const mouseTracker = document.getElementById("mouse-preview");
const tickTracker = document.getElementById("tick-preview");
const itemTracker = document.getElementById("item-preview");
let activeTile = null;

let totalTicks = 0;
let totalTickingTime = 0;

function init() {
    viewport.start();
    terrain.loadStartingChunks(camCentreX, camCentreY);
}

function updateViewport() {
    viewport.clear();
    const diff = Date.now() - lastUpdated;
    totalTicks += 1;
    totalTickingTime += diff;
    inputHandler.tick(diff);
    activeTile = inputHandler.selectTile();
    renderer.uiMap["selector"].changeTile(activeTile.x, activeTile.y)
    updateCoordinateTracker();
    terrain.updateAll(terrain.terrainMap); // LAYER 1 - BASE LAYER, UNCHANGEABLE
    terrain.updateAll(terrain.decorMap); // LAYER 2 - DECOR MAP, WORLD UPDATES
    terrain.updateAllUI(renderer.uiMap); // LAYER 3 - UI ELEMENTS
    if (totalTicks % 30 === 0) terrain.cache();
}

function getTerrainGenerator() {
    return this.terrain;
}


function updateCoordinateTracker() {
    coordinateTracker.innerHTML = "[Camera] X: "+ (Math.round(camCentreX*2)/2).toFixed(1) +" Y: "+ (Math.round(camCentreY*2)/2).toFixed(1);
    mouseTracker.innerHTML = "[Mouse] X: "+ (Math.round(mouseX*2)/2).toFixed(1) +" Y: "+ (Math.round(mouseY*2)/2).toFixed(1);
    tickTracker.innerHTML = "[Avg Tick] " + Math.round(10*(totalTickingTime / totalTicks))/10 + "ms"
    itemTracker.innerHTML = "[Holding] " + sprites[itemID].namedID + ":" + itemID;
}

init();