const renderer = new RenderEngine();
const viewport = renderer.viewport;
const terrain = new TerrainGenerator(window.innerWidth, window.innerHeight);
const inputHandler = new InputHandler();

let lastUpdated = Date.now();

const coordinateTracker = document.getElementById("location-preview")
const mouseTracker = document.getElementById("mouse-preview")
let activeTile = null;

function init() {
    viewport.start();
    terrain.generate();
}

function updateViewport() {
    viewport.clear();
    const diff = Date.now() - lastUpdated;
    inputHandler.tick(diff);
    activeTile = inputHandler.selectTile();
    updateCoordinateTracker();
    terrain.updateAll();
}

function getTerrainGenerator() {
    return this.terrain;
}


function updateCoordinateTracker() {
    coordinateTracker.innerHTML = "[Camera] X: "+ (Math.round(camCentreX*2)/2).toFixed(1) +" Y: "+ (Math.round(camCentreY*2)/2).toFixed(1);
    mouseTracker.innerHTML = "[Mouse] X: "+ (Math.round(mouseX*2)/2).toFixed(1) +" Y: "+ (Math.round(mouseY*2)/2).toFixed(1);
}

init();