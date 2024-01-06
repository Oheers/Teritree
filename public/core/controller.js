const renderer = new RenderEngine();
const viewport = renderer.viewport;
const terrain = new TerrainGenerator(1920, 1080);
const inputHandler = new InputManager();

let lastUpdated = Date.now();

const coordinateTracker = document.getElementById("location-preview");
const mouseTracker = document.getElementById("mouse-preview");
const tickTracker = document.getElementById("tick-preview");
const itemTracker = document.getElementById("item-preview");
let activeTile = null;

const PLAYER_WIDTH = 80;

let totalTicks = 0;
let totalTickingTime = 0;

async function init() {
    const start = Date.now();
    viewport.start();

    try {
        const result = await fetchWorldData();

        if (!result) {
            console.error("Error occurred whilst fetching data about the world.");
            renderer.error = true;
            return;
        }

        const uiElements = document.querySelectorAll('.ui');

        uiElements.forEach(element => {
            element.style.display = 'block';
        });

        terrain.loadStartingChunks(camCentreX, camCentreY);
        terrain.addNewPlayer("You", true, 0, 0, "ed", 0)
        renderer.loading = false;
    } catch (error) {
        console.error(error);
        // Handle error appropriately
    }
}

function updateViewport() {
    viewport.clear();
    if (renderer.loading) {
        const ctx = renderer.viewportArea.context;
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        if (renderer.error) {
            ctx.fillText("There was an error whilst fetching data about the world.", ctx.canvas.width / 2, ctx.canvas.height / 2);
        } else {
            ctx.fillText("Loading . . .", ctx.canvas.width / 2, ctx.canvas.height / 2);
        }
        return;
    }
    const diff = Date.now() - lastUpdated;
    totalTicks += 1;
    totalTickingTime += diff;
    inputHandler.tick(diff);
    activeTile = inputHandler.selectTile();
    renderer.uiMap["selector"].changeTile(activeTile.x, activeTile.y)
    updateCoordinateTracker();
    terrain.updateAll(terrain.terrainMap); // LAYER 1 - BASE LAYER, UNCHANGEABLE
    terrain.updateAll(terrain.decorMap); // LAYER 2 - DECOR MAP, WORLD UPDATES
    terrain.updateAllUI(renderer.uiMap); // LAYER 3 - UI ELEMENTS & PLAYERS
    terrain.updateAllPlayers() // LAYER 3
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

init().then(r => console.log("Hello world."));