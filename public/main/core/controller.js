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

        document.getElementById("town-invitecode").value = generateRandomCode();
        loadAbstractWorld();
    } catch (error) {
        console.error(error);
        // Handle error appropriately
    }
}

async function unloadWorld() {
    terrain.unloadAll();
}

async function loadWorld() {
    terrain.loadStartingChunks(camCentreX, camCentreY);
    terrain.addNewPlayer("You", true, 0, 0, "You", 0, itemID)
    renderer.loading = false;
}

function updateViewport() {
    viewport.clear();
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

        document.querySelectorAll('.default-hidden-ui').forEach(element => {
            element.style.display = 'none';
        });
        const ctx = renderer.viewportArea.context;
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = "#000000";
        ctx.fillText(renderer.errorMSG, ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }
    const diff = Date.now() - lastUpdated;
    totalTicks += 1;
    totalTickingTime += diff;
    inputHandler.tick(diff);
    activeTile = inputHandler.selectTile();
    if (activeTile !== null) renderer.uiMap["selector"].changeTile(activeTile.x, activeTile.y)
    updateWorldResetTracker();
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
        return false;
    } else {
        renderer.error = false;
        return true;
    }
}

function updateCoordinateTracker() {
    xTracker.innerHTML = "<b>X:</b> "+ Math.floor(camCentreX);
    yTracker.innerHTML = "<b>Y:</b> "+ Math.floor(camCentreY);
}

function updateWorldResetTracker() {
    const now = new Date();
    const sec = 604800 - (((now.getDay() + 6) % 7) * 86400 +
        now.getHours() * 3600 +
        now.getMinutes() * 60 +
        now.getSeconds());
    document.getElementById("world-reset").innerHTML = `World Resetting: ${Math.floor(sec / 86400)}d, 
    ${Math.floor((sec % 86400) / 3600)}h, ${Math.floor((sec % 3600) / 60)}m, ${Math.floor(sec % 60)}s`;
}

init().then(r => console.log("Hello world."));