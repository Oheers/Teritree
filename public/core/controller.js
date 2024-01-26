const renderer = new RenderEngine();
const viewport = renderer.viewport;
const terrain = new TerrainGenerator(1920, 1080);
const inputHandler = new InputManager();

let lastUpdated = Date.now();

const xTracker = document.getElementById("x-preview");
const yTracker = document.getElementById("y-preview");
const townTracker = document.getElementById("town-preview");
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
            renderer.errorMSG = "There was an error whilst fetching data about the world.";
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
    checkSocketIOConnection()
    if (renderer.loading) {
        const ctx = renderer.viewportArea.context;
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Loading . . .", ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    } else if (renderer.error) {
        document.querySelectorAll('.ui').forEach(element => {
            element.style.display = 'none';
        });
        const ctx = renderer.viewportArea.context;
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText(renderer.errorMSG, ctx.canvas.width / 2, ctx.canvas.height / 2);
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

function checkSocketIOConnection() {
    if (!socket.connected) {
        renderer.error = true;
        renderer.errorMSG = "Disconnected from server."
    } else {
        renderer.error = false;
    }
}

function updateCoordinateTracker() {
    xTracker.innerHTML = "<b>X:</b> "+ Math.floor(camCentreX);
    yTracker.innerHTML = "<b>Y:</b> "+ Math.floor(camCentreY);
    townTracker.innerHTML = "<b>Town:</b> "+ "None";
}

init().then(r => console.log("Hello world."));