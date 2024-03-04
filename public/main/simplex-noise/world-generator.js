const GRASS = "#a8ca58";
const FOREST = "#75a743";
const DARK_FOREST = "#468232"
const DARKER_FOREST = "#25562e"
const COLD_GRASS = "#7fe19b"
const DEAD_GRASS = "#c2b781"
const SAND = "#e8c170";
const RIVER = "#73bed3";
const SEA = "#4f8fba";
const OCEAN = "#3c5e8b"
const SNOW = "#ebede9"
const ICE = "#a4dddb";
const DRY = "#ad7757"
const BURNT = "#884b2b";

function standardColourRendering(tileX, tileY) {

    noise.seed(terrain.seed)
    const height = Math.abs(noise.simplex2(tileX / 400, tileY / 400));
    noise.seed(terrain.seed + 1)
    const warmth = Math.abs(noise.simplex2(tileX / 1000, tileY / 1000));
    noise.seed(terrain.seed + 2)
    const dampness = Math.abs(noise.simplex2(tileX / 500, tileY / 500));

    // HEIGHT
    if (renderer.viewDebugType === "height") {
        if (height < 0.25 * dampness) {
            return `rgb(${75 - (height * 75 * 4)}, ${150 - (height * 150 * 4)}, ${255 - (height * 255 * 4)})`
        } else {
            return `rgb(${height * 256}, ${height * 256}, ${height * 256})`;
        }
    }

    // HEAT
    if (renderer.viewDebugType === "warmth") return `rgb(${warmth * 256}, 64, ${(1 - warmth) * 256})`

    if (renderer.viewDebugType === "damp") return `rgb(${(1 - dampness) * 256}, ${192 - (42 * dampness)}, ${256 * dampness})`

    if (renderer.viewDebugType === "random") {
        noise.seed(terrain.seed + 4);
        const random = Math.abs(noise.simplex2(tileX, tileY));
        return `rgb(0, ${(1 - random) * 256}, 0)`
    }

    if (renderer.viewDebugType === "tree") {
        noise.seed(terrain.seed + 3)
        const treeSpread = Math.abs(noise.simplex2(tileX / 50, tileY / 50));
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
        } else if (warmth > 0.22) {
            // Forest area
            if (dampness > 0.85) {
                return DARKER_FOREST;
            } else if (dampness > 0.7) {
                return DARK_FOREST
            } else if (dampness > 0.4) {
                return FOREST
            } else if (dampness < 0.1) {
                return DEAD_GRASS
            } else {
                return GRASS;
            }
        } else if (warmth > 0.15) {
            return COLD_GRASS;
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

function shouldPlaceTree(tileX, tileY, floor) {
    noise.seed(terrain.seed + 3)
    const treeSpread = Math.abs(noise.simplex2(tileX / 50, tileY / 50));
    noise.seed(terrain.seed + 4);
    const random = Math.abs(noise.simplex2(tileX + 0.53, tileY + 0.53));

    if ((treeSpread > 0.75 && random > 0.75) ||
        (treeSpread > 0.50 && random > 0.9) ||
        (treeSpread > 0.35 && random > 0.95) ||
        (random > 0.985)) {
        return pickTree(random, floor);
    } else {
        return -1;
    }
}

function pickTree(random, floor) {
    if (floor === GRASS) {
        return Math.floor(random * 100) % 3
    } else if (floor === FOREST) {
        return (Math.floor(random * 100) % 3) + 3;
    } else if (floor === DARK_FOREST) {
        return (Math.floor(random * 100) % 3) + 6;
    } else if (floor === DARKER_FOREST) {
        return (Math.floor(random * 100) % 3) + 9;
    } else if (floor === SNOW) {
        return (Math.floor(random * 100) % 3) + 12;
    } else if (floor === ICE) {
        return (Math.floor(random * 100) % 3) + 15;
    } else if (floor === DRY) {
        return (Math.floor(random * 100) % 6) + 18;
    } else if (floor === SAND) {
        return (Math.floor(random * 100) % 4) + 29;
    } else if (floor === BURNT) {
        const id = Math.floor(random * 100) % 9;
        if (id < 6) {
            return id + 18;
        } else {
            return 33 + (2 * (id - 6))
        }
    } else if (floor === COLD_GRASS) {
        return (Math.floor(random * 100) % 6) + 118;
    } else if (floor === DEAD_GRASS) {
        return 35;
    } else {
        return -1;
    }
}

function shouldPlaceShrubbery(tileX, tileY, floor) {
    noise.seed(terrain.seed + 5);
    const random = Math.abs(noise.simplex2(tileX + 0.53, tileY + 0.53));

    if (random > 0.75) {
        return pickShrub(random, floor);
    } else return -1;
}

function pickShrub(random, floor) {
    if (floor === GRASS) {
        const id = Math.floor(random * 100) % 10
        if (id < 6) {
            return id + 45
        } else {
            return 72 + id;
        }
    } else if (floor === FOREST) {
        const id = Math.floor(random * 100) % 10
        if (id < 3) {
            return id + 45
        } else if (id < 6) {
            return id + 48;
        } else {
            return 76 + id;
        }
    } else if (floor === DARK_FOREST) {
        const id = Math.floor(random * 100) % 10
        if (id < 3) {
            return id + 45
        } else if (id < 6) {
            return id + 51;
        } else {
            return 80 + id;
        }
    } else if (floor === DARKER_FOREST) {
        const id = Math.floor(random * 100) % 10
        if (id < 3) {
            return id + 45
        } else if (id < 6) {
            return id + 54;
        } else {
            return 84 + id;
        }
    } else if (floor === SNOW) {
        const id = Math.floor(random * 100) % 10
        if (id < 3) {
            return id + 45
        } else if (id < 6) {
            return id + 57;
        } else {
            return 88 + id;
        }
    } else if (floor === ICE) {
        const id = Math.floor(random * 100) % 10
        if (id < 3) {
            return id + 45
        } else if (id < 6) {
            return id + 60;
        } else {
            return 92 + id;
        }
    } else if (floor === DRY) {
        const id = Math.floor(random * 100) % 13
        if (id < 3) {
            return id + 45
        } else if (id < 9) {
            return id + 63;
        } else {
            return 93 + id;
        }
    } else if (floor === BURNT) {
        const id = Math.floor(random * 100) % 13
        if (id < 3) {
            return id + 45
        } else if (id < 9) {
            return id + 63;
        } else {
            return 97 + id;
        }
    } else if (floor === SAND) {
        const id = Math.floor(random * 100) % 14
        if (id < 5) {
            return id + 24;
        } else if (id < 8) {
            return id + 40
        } else {
            return 64 + id;
        }
    } else if (floor === COLD_GRASS) {
        const id = Math.floor(random * 100) % 5;
        return id + 124;
    } else if (floor === DEAD_GRASS) {
        const id = Math.floor(random * 100) % 2;
        return id + 129;
    }

    return -1;
}
