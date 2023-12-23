const SPRITESHEET_WIDTH = 20;
const PIXELS_WIDTH = 16;
const PIXELS_HEIGHT = 16;

class Sprite {

    constructor(id, tUp, tDown, tLeft, tRight, namedID, name_en) {
        this._id = id;
        const coords = getImageCoords(id);
        this._sx = coords.sx;
        this._sy = coords.sy;
        this._tDown= tDown;
        this._tUp = tUp;
        this._tLeft = tLeft;
        this._tRight = tRight;
        this._namedID = namedID;
        this._name_en = name_en;
    }


    get id() {
        return this._id;
    }

    get namedID() {
        return this._namedID;
    }

    get name_en() {
        return this._name_en;
    }

    get sx() {
        return this._sx;
    }

    get sy() {
        return this._sy;
    }


    get tUp() {
        return this._tUp;
    }

    get tDown() {
        return this._tDown;
    }

    get tLeft() {
        return this._tLeft;
    }

    get tRight() {
        return this._tRight;
    }
}

const sprites = {};

sprites[0] = new Sprite(0, 0, 0.75, 0.75, 0.75, "normal_tree1", "Tree")
sprites[1] = new Sprite(1, 0, 0.9, 0.75, 0.75, "normal_tree2", "Tree")
sprites[2] = new Sprite(2, 0, 0.5, 0.5, 0.5, "normal_tree3", "Tree")
sprites[3] = new Sprite(3, 0, 0.75, 0.75, 0.75, "forest_tree1", "Forest Tree")
sprites[4] = new Sprite(4, 0, 0.9, 0.75, 0.75,  "forest_tree2", "Forest Tree")
sprites[5] = new Sprite(5, 0, 0.5, 0.5, 0.5,  "forest_tree3", "Forest Tree")
sprites[6] = new Sprite(6, 0, 0.75, 0.75, 0.75, "dark_tree1", "Dark Tree")
sprites[7] = new Sprite(7, 0, 0.9, 0.75, 0.75,  "dark_tree2", "Dark Tree")
sprites[8] = new Sprite(8, 0, 0.5, 0.5, 0.5,  "dark_tree3", "Dark Tree")
sprites[9] = new Sprite(9, 0, 0.75, 0.75, 0.75, "darker_tree1", "Dark Forest Tree")
sprites[10] = new Sprite(10, 0, 0.9, 0.75, 0.75,  "darker_tree2", "Dark Forest Tree")
sprites[11] = new Sprite(11, 0, 0.5, 0.5, 0.5,  "darker_tree3", "Dark Forest Tree")
sprites[12] = new Sprite(12, 0, 0.75, 0.75, 0.75, "snowy_tree1", "Snowy Tree")
sprites[13] = new Sprite(13, 0, 0.9, 0.75, 0.75,  "snowy_tree2", "Snowy Tree")
sprites[14] = new Sprite(14, 0, 0.5, 0.5, 0.5,  "snowy_tree3", "Snowy Tree")
sprites[15] = new Sprite(15, 0, 0.75, 0.75, 0.75, "icy_tree1", "Icy Tree")
sprites[16] = new Sprite(16, 0, 0.9, 0.75, 0.75,  "icy_tree2", "Icy Tree")
sprites[17] = new Sprite(17, 0, 0.5, 0.5, 0.5,  "icy_tree3", "Icy Tree")
sprites[18] = new Sprite(18, 0, 0.75, 0.75, 0.75, "autumn_tree1", "Autumn Tree")
sprites[19] = new Sprite(19, 0, 0.9, 0.75, 0.75,  "autumn_tree2", "Autumn Tree")
sprites[20] = new Sprite(20, 0, 0.5, 0.5, 0.5,  "autumn_tree3", "Autumn Tree")
sprites[21] = new Sprite(21, 0, 0.75, 0.75, 0.75, "red_tree1", "Red Tree")
sprites[22] = new Sprite(22, 0, 0.9, 0.75, 0.75,  "red_tree2", "Red Tree")
sprites[23] = new Sprite(23, 0, 0.5, 0.5, 0.5,  "red_tree3", "Red Tree")
sprites[24] = new Sprite(24, 2.5, 0.5, 0.5, 0.5, "cactus1", "Little Cactus")
sprites[25] = new Sprite(25, 1, 0.5, 0.75, 0.75,  "cactus2", "Cactus")
sprites[26] = new Sprite(26, 1, 0.5, 0.75, 0.75,  "cactus3", "Big Cactus")
sprites[27] = new Sprite(27, 2, 0, 0, 1, "leaves1", "Leaves")
sprites[28] = new Sprite(28, 2, 0, 0, 1, "leaves2", "Leaves")
sprites[29] = new Sprite(29, 0, 0.5, 0, 1, "palm_tree_right", "Coconut Tree")
sprites[30] = new Sprite(30, 0, 0.5, 1, 0, "coconut_tree_right", "Coconut Tree")
sprites[31] = new Sprite(31, 0, 0.5, 0, 1, "palm_tree_left", "Coconut Tree")
sprites[32] = new Sprite(32, 0, 0.5, 1, 0, "coconut_tree_left", "Coconut Tree")
sprites[33] = new Sprite(33, 0, 0.5, 0.5, 0.5, "dead_tree", "Dead Tree")
sprites[34] = new Sprite(34, 0, 0.5, 0.5, 0.5, "snowy_dead_tree", "Dead Tree")
sprites[35] = new Sprite(35, 0, 0.5, 0.5, 0.5, "hot_dead_tree", "Dead Tree")
sprites[36] = new Sprite(36, 0, 0.5, 0.5, 0.5, "hot_snowy_dead_tree", "Dead Tree")
sprites[37] = new Sprite(37, 0, 0.5, 0.5, 0.5, "hotter_dead_tree", "Dead Tree")
sprites[38] = new Sprite(38, 0, 0.5, 0.5, 0.5, "hotter_snowy_dead_tree", "Dead Tree")

function getImageCoords(itemID) {
    return {
        sx: (itemID % SPRITESHEET_WIDTH) * PIXELS_WIDTH,
        sy: Math.floor(itemID / SPRITESHEET_WIDTH) * PIXELS_HEIGHT
    }
}

