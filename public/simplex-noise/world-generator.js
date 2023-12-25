const GRASS = "#a8ca58";
const FOREST = "#75a743";
const DARK_FOREST = "#468232"
const DARKER_FOREST = "#25562e"
const SAND = "#e8c170";
const RIVER = "#73bed3";
const SEA = "#4f8fba";
const OCEAN = "#3c5e8b"
const SNOW = "#ebede9"
const ICE = "#a4dddb";
const DRY = "#ad7757"
const BURNT = "#884b2b";

function standardColourRendering(tileX, tileY) {
    console.log(tileX, tileY);
    noise.seed(WORLD_SEED)
    const height = Math.abs(noise.simplex2(tileX / 400, tileY / 400));
    noise.seed(WORLD_SEED + 1)
    const warmth = Math.abs(noise.simplex2(tileX / 1000, tileY / 1000));
    noise.seed(WORLD_SEED + 2)
    const dampness = Math.abs(noise.simplex2(tileX / 100, tileY / 100));
    noise.seed(WORLD_SEED + 3)
    const treeSpread = Math.abs(noise.simplex2(tileX / 50, tileY / 50));

    // HEIGHT
    console.log(renderer.viewDebugType)
    if (renderer.viewDebugType === "height") return `rgb(${height * 256}, ${height * 256}, ${height * 256})`;

    // HEAT
    if (renderer.viewDebugType === "warmth") return `rgb(${warmth * 256}, 64, ${(1 - warmth) * 256})`

    if (renderer.viewDebugType === "damp") return `rgb(${150 - (dampness * 100)}, ${150 - (dampness * 128)}, ${dampness * 256})`

    if (renderer.viewDebugType === "tree") {
        if (treeSpread > 0.75) {
            return "rgb(255, 0, 0)"
        } else if (treeSpread > 0.5) {
            return "rgb(255, 100, 0)"
        } else if (treeSpread > 0.35) {
            return "rgb(255, 200, 50)"
        } else {
            return "rgb(255, 255, 200)"
        }
    }

    if (2 * height < 0.5 * dampness || height < 0.002) {
        // There should be a water form appearing here
        if (height < 0.0025) {
            return OCEAN;
        } else if (height < 0.05) {
            return SEA;
        } else {
            return RIVER;
        }
    } else if (height < 0.2 && warmth > 0.35) {
        // The height is just above river level.
        return SAND;
    } else {
        // This is normal land, either snow, desert or grass.
        if (warmth > 0.65) {
            // We're in a desert area
            if (dampness > 0.8 && warmth > 0.7) {
                return BURNT;
            } else if (dampness > 0.6) {
                return DRY;
            } else {
                return SAND;
            }
        } else if (warmth > 0.35) {
            // Forest area
            if (dampness > 0.85) {
                return DARKER_FOREST;
            } else if (dampness > 0.7) {
                return DARK_FOREST
            } else if (dampness > 0.4) {
                return FOREST
            } else {
                return GRASS;
            }
        } else {
            // Snowy area
            if (dampness > 0.65) {
                return ICE;
            } else {
                return SNOW;
            }
        }
    }
}
