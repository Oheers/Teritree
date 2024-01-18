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

sprites[-1] = new Sprite(-1, 0, 0, 0, 0, "nothing", "Nothing")
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
sprites[24] = new Sprite(24, 2.5, 0.5, 1, 1, "cactus1", "Little Cactus")
sprites[25] = new Sprite(25, 1, 0.5, 1, 1,  "cactus2", "Cactus")
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
sprites[39] = new Sprite(39, 0, 0.5, 0, 1, "palm_tree_right_stump", "Palm Tree Stump")
sprites[40] = new Sprite(40, 0, 0.5, 1, 0, "palm_tree_left_stump", "Palm Tree Stump")
sprites[41] = new Sprite(41, 0, 0.5, 1, 1, "normal_tree_stump", "Tree Stump")
sprites[42] = new Sprite(42, 0, 0.5, 1, 1, "dry_tree_stump", "Tree Stump")
sprites[43] = new Sprite(43, 0, 0.5, 1, 1, "big_normal_tree_stump", "Big Tree Stump")
sprites[44] = new Sprite(44, 0, 0.5, 1, 1, "big_dry_tree_stump", "Big Tree Stump")
sprites[45] = new Sprite(45, 1, 0.5, 0.5, 0.5, "regular_rock1", "Rock")
sprites[46] = new Sprite(46, 1, 0.5, 0.5, 0.5, "regular_rock2", "Rock")
sprites[47] = new Sprite(47, 0.5, 0.5, 0.5, 0.5, "regular_rock3", "Big Rock")
sprites[48] = new Sprite(48, 1, 0.5, 0.5, 0.5, "grass_rock1", "Grass Rock")
sprites[49] = new Sprite(49, 1, 0.5, 0.5, 0.5, "grass_rock2", "Grass Rock")
sprites[50] = new Sprite(50, 0.5, 0.5, 0.5, 0.5, "grass_rock3", "Big Grass Rock")
sprites[51] = new Sprite(51, 1, 0.5, 0.5, 0.5, "forest_rock1", "Forest Rock")
sprites[52] = new Sprite(52, 1, 0.5, 0.5, 0.5, "forest_rock2", "Forest Rock")
sprites[53] = new Sprite(53, 0.5, 0.5, 0.5, 0.5, "forest_rock3", "Big Forest Rock")
sprites[54] = new Sprite(54, 1, 0.5, 0.5, 0.5, "dark_forest_rock1", "Dark Forest Rock")
sprites[55] = new Sprite(55, 1, 0.5, 0.5, 0.5, "dark_forest_rock2", "Dark Forest Rock")
sprites[56] = new Sprite(56, 0.5, 0.5, 0.5, 0.5, "dark_forest_rock3", "Big Dark Forest Rock")
sprites[57] = new Sprite(57, 1, 0.5, 0.5, 0.5, "darker_forest_rock1", "Darker Forest Rock")
sprites[58] = new Sprite(58, 1, 0.5, 0.5, 0.5, "darker_forest_rock2", "Darker Forest Rock")
sprites[59] = new Sprite(59, 0.5, 0.5, 0.5, 0.5, "darker_forest_rock3", "Big Darker Forest Rock")
sprites[60] = new Sprite(60, 1, 0.5, 0.5, 0.5, "snowy_rock1", "Snowy Rock")
sprites[61] = new Sprite(61, 1, 0.5, 0.5, 0.5, "snowy_rock2", "Snowy Rock")
sprites[62] = new Sprite(62, 0.5, 0.5, 0.5, 0.5, "snowy_rock3", "Big Snowy Rock")
sprites[63] = new Sprite(63, 1, 0.5, 0.5, 0.5, "icy_rock1", "Icy Rock")
sprites[64] = new Sprite(64, 1, 0.5, 0.5, 0.5, "icy_rock2", "Icy Rock")
sprites[65] = new Sprite(65, 0.5, 0.5, 0.5, 0.5, "icy_rock3", "Big Icy Rock")
sprites[66] = new Sprite(66, 1, 0.5, 0.5, 0.5, "autumn_rock1", "Autumn Rock")
sprites[67] = new Sprite(67, 1, 0.5, 0.5, 0.5, "autumn_rock2", "Autumn Rock")
sprites[68] = new Sprite(68, 0.5, 0.5, 0.5, 0.5, "autumn_rock3", "Big Autumn Rock")
sprites[69] = new Sprite(69, 1, 0.5, 0.5, 0.5, "red_rock1", "Red Rock")
sprites[70] = new Sprite(70, 1, 0.5, 0.5, 0.5, "red_rock2", "Red Rock")
sprites[71] = new Sprite(71, 0.5, 0.5, 0.5, 0.5, "red_rock3", "Big Red Rock")
sprites[72] = new Sprite(72, 4, 4, 2, 2, "sand_pebble", "Sandy Pebble")
sprites[73] = new Sprite(73, 4, 4, 2, 2, "sand_pebbles", "Sandy Pebbles")
sprites[74] = new Sprite(74, 0.5, 0.5, 0.5, 0.5, "sand_footsteps1", "Sandy Footsteps")
sprites[75] = new Sprite(75, 0.5, 1, 0.5, 0.5, "sand_footsteps2", "Sandy Footsteps")
sprites[76] = new Sprite(76, 0, 0, 0, 0, "sand_path1", "Sandy Path")
sprites[77] = new Sprite(77, 0, 0, 0, 0, "sand_path2", "Sandy Path")
sprites[78] = new Sprite(78, 4, 4, 2, 2, "grass_pebble", "Grassy Pebble")
sprites[79] = new Sprite(79, 4, 4, 2, 2, "grass_pebbles", "Grassy Pebbles")
sprites[80] = new Sprite(80, 4, 3, 3, 2, "grass_leaves1", "Grassy Leaves")
sprites[81] = new Sprite(81, 4, 3, 3, 2, "grass_leaves2", "Grassy Leaves")
sprites[82] = new Sprite(82, 4, 4, 2, 2, "forest_pebble", "Forest Pebble")
sprites[83] = new Sprite(83, 4, 4, 2, 2, "forest_pebbles", "Forest Pebbles")
sprites[84] = new Sprite(84, 4, 3, 3, 2, "forest_leaves1", "Forest Leaves")
sprites[85] = new Sprite(85, 4, 3, 3, 2, "forest_leaves2", "Forest Leaves")
sprites[86] = new Sprite(86, 4, 4, 2, 2, "dark_forest_pebble", "Dark Forest Pebble")
sprites[87] = new Sprite(87, 4, 4, 2, 2, "dark_forest_pebbles", "Dark Forest Pebbles")
sprites[88] = new Sprite(88, 4, 3, 3, 2, "dark_forest_leaves1", "Dark Forest Leaves")
sprites[89] = new Sprite(89, 4, 3, 3, 2, "dark_forest_leaves2", "Dark Forest Leaves")
sprites[90] = new Sprite(90, 4, 4, 2, 2, "darker_forest_pebble", "Darker Forest Pebble")
sprites[91] = new Sprite(91, 4, 4, 2, 2, "darker_forest_pebbles", "Darker Forest Pebbles")
sprites[92] = new Sprite(92, 4, 3, 3, 2, "darker_forest_leaves1", "Darker Forest Leaves")
sprites[93] = new Sprite(93, 4, 3, 3, 2, "darker_forest_leaves2", "Darker Forest Leaves")
sprites[94] = new Sprite(94, 4, 4, 2, 2, "snowy_pebble", "Snowy Pebble")
sprites[95] = new Sprite(95, 4, 4, 2, 2, "snow_pebbles", "Snowy Pebbles")
sprites[96] = new Sprite(96, 5, 4, 2, 2, "snow_footsteps1", "Snowy Footsteps")
sprites[97] = new Sprite(97, 2, 2, 2, 3, "snow_footsteps2", "Snowy Footsteps")
sprites[98] = new Sprite(98, 4, 4, 2, 2, "icy_pebble", "Icy Pebble")
sprites[99] = new Sprite(99, 4, 4, 2, 2, "icy_pebbles", "Icy Pebbles")
sprites[100] = new Sprite(100, 5, 4, 2, 2, "icy_footsteps1", "Icy Footsteps")
sprites[101] = new Sprite(101, 2, 2, 2, 3, "icy_footsteps2", "Icy Footsteps")
sprites[102] = new Sprite(102, 4, 4, 2, 2, "dry_pebble", "Dry Pebble")
sprites[103] = new Sprite(103, 4, 4, 2, 2, "dry_pebbles", "Dry Pebbles")
sprites[104] = new Sprite(104, 4, 3, 3, 2, "dry_leaves1", "Dry Leaves")
sprites[105] = new Sprite(105, 4, 3, 3, 2, "dry_leaves2", "Dry Leaves")
sprites[106] = new Sprite(106, 4, 4, 2, 2, "burnt_pebble", "Burnt Pebble")
sprites[107] = new Sprite(107, 4, 4, 2, 2, "burnt_pebbles", "Burnt Pebbles")
sprites[108] = new Sprite(108, 4, 3, 3, 2, "burnt_leaves1", "Burnt Leaves")
sprites[109] = new Sprite(109, 4, 3, 3, 2, "burnt_leaves2", "Burnt Leaves")
sprites[117] = new Sprite(117, 0, 0, 0, 0, "selector_icon", "Selector")

function getImageCoords(itemID) {
    return {
        sx: (itemID % SPRITESHEET_WIDTH) * PIXELS_WIDTH,
        sy: Math.floor(itemID / SPRITESHEET_WIDTH) * PIXELS_HEIGHT
    }
}

