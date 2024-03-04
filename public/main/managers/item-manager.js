const SPRITESHEET_WIDTH = 20;
const PIXELS_WIDTH = 16;
const PIXELS_HEIGHT = 16;

class Sprite {

    constructor(id, tUp, tDown, tLeft, tRight, namedID, movable, name_en) {
        this._id = id;
        const coords = getImageCoords(id);
        this._sx = coords.sx;
        this._sy = coords.sy;
        this._tDown= tDown;
        this._tUp = tUp;
        this._tLeft = tLeft;
        this._tRight = tRight;
        this._namedID = namedID;
        this._movable = movable;
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

    get movable() {
        return this._movable;
    }
}

const sprites = {};

sprites[-1] = new Sprite(-1, 0, 0, 0, 0, "nothing", false, "Nothing")
sprites[0] = new Sprite(0, 0, 0.75, 0.75, 0.75, "normal_tree1", true, "Tree")
sprites[1] = new Sprite(1, 0, 0.9, 0.75, 0.75, "normal_tree2", true, "Tree")
sprites[2] = new Sprite(2, 0, 0.5, 0.5, 0.5, "normal_tree3", true, "Tree")
sprites[3] = new Sprite(3, 0, 0.75, 0.75, 0.75, "forest_tree1", true, "Forest Tree")
sprites[4] = new Sprite(4, 0, 0.9, 0.75, 0.75,  "forest_tree2", true, "Forest Tree")
sprites[5] = new Sprite(5, 0, 0.5, 0.5, 0.5,  "forest_tree3", true, "Forest Tree")
sprites[6] = new Sprite(6, 0, 0.75, 0.75, 0.75, "dark_tree1", true, "Dark Tree")
sprites[7] = new Sprite(7, 0, 0.9, 0.75, 0.75,  "dark_tree2", true, "Dark Tree")
sprites[8] = new Sprite(8, 0, 0.5, 0.5, 0.5,  "dark_tree3", true, "Dark Tree")
sprites[9] = new Sprite(9, 0, 0.75, 0.75, 0.75, "darker_tree1", true, "Dark Forest Tree")
sprites[10] = new Sprite(10, 0, 0.9, 0.75, 0.75,  "darker_tree2", true, "Dark Forest Tree")
sprites[11] = new Sprite(11, 0, 0.5, 0.5, 0.5,  "darker_tree3", true, "Dark Forest Tree")
sprites[12] = new Sprite(12, 0, 0.75, 0.75, 0.75, "snowy_tree1", true, "Snowy Tree")
sprites[13] = new Sprite(13, 0, 0.9, 0.75, 0.75,  "snowy_tree2", true, "Snowy Tree")
sprites[14] = new Sprite(14, 0, 0.5, 0.5, 0.5,  "snowy_tree3", true, "Snowy Tree")
sprites[15] = new Sprite(15, 0, 0.75, 0.75, 0.75, "icy_tree1", true, "Icy Tree")
sprites[16] = new Sprite(16, 0, 0.9, 0.75, 0.75,  "icy_tree2", true, "Icy Tree")
sprites[17] = new Sprite(17, 0, 0.5, 0.5, 0.5,  "icy_tree3", true, "Icy Tree")
sprites[18] = new Sprite(18, 0, 0.75, 0.75, 0.75, "autumn_tree1", true, "Autumn Tree")
sprites[19] = new Sprite(19, 0, 0.9, 0.75, 0.75,  "autumn_tree2", true, "Autumn Tree")
sprites[20] = new Sprite(20, 0, 0.5, 0.5, 0.5,  "autumn_tree3", true, "Autumn Tree")
sprites[21] = new Sprite(21, 0, 0.75, 0.75, 0.75, "red_tree1", true, "Red Tree")
sprites[22] = new Sprite(22, 0, 0.9, 0.75, 0.75,  "red_tree2", true, "Red Tree")
sprites[23] = new Sprite(23, 0, 0.5, 0.5, 0.5,  "red_tree3", true, "Red Tree")
sprites[24] = new Sprite(24, 2.5, 0.5, 1, 1, "cactus1", true, "Little Cactus")
sprites[25] = new Sprite(25, 1, 0.5, 1, 1,  "cactus2", true, "Cactus")
sprites[26] = new Sprite(26, 1, 0.5, 0.75, 0.75,  "cactus3", true, "Big Cactus")
sprites[27] = new Sprite(27, 2, 0, 0, 1, "leaves1", true, "Leaves")
sprites[28] = new Sprite(28, 2, 0, 0, 1, "leaves2", true, "Leaves")
sprites[29] = new Sprite(29, 0, 0.5, 0, 1, "palm_tree_right", true, "Coconut Tree")
sprites[30] = new Sprite(30, 0, 0.5, 1, 0, "coconut_tree_right", true, "Coconut Tree")
sprites[31] = new Sprite(31, 0, 0.5, 0, 1, "palm_tree_left", true, "Coconut Tree")
sprites[32] = new Sprite(32, 0, 0.5, 1, 0, "coconut_tree_left", true, "Coconut Tree")
sprites[33] = new Sprite(33, 0, 0.5, 0.5, 0.5, "dead_tree", true, "Dead Tree")
sprites[34] = new Sprite(34, 0, 0.5, 0.5, 0.5, "snowy_dead_tree", true, "Dead Tree")
sprites[35] = new Sprite(35, 0, 0.5, 0.5, 0.5, "hot_dead_tree", true, "Dead Tree")
sprites[36] = new Sprite(36, 0, 0.5, 0.5, 0.5, "hot_snowy_dead_tree", true, "Dead Tree")
sprites[37] = new Sprite(37, 0, 0.5, 0.5, 0.5, "hotter_dead_tree", true, "Dead Tree")
sprites[38] = new Sprite(38, 0, 0.5, 0.5, 0.5, "hotter_snowy_dead_tree", true, "Dead Tree")
sprites[39] = new Sprite(39, 0, 0.5, 0, 1, "palm_tree_right_stump", true, "Palm Tree Stump")
sprites[40] = new Sprite(40, 0, 0.5, 1, 0, "palm_tree_left_stump", true, "Palm Tree Stump")
sprites[41] = new Sprite(41, 0, 0.5, 1, 1, "normal_tree_stump", true, "Tree Stump")
sprites[42] = new Sprite(42, 0, 0.5, 1, 1, "dry_tree_stump", true, "Tree Stump")
sprites[43] = new Sprite(43, 0, 0.5, 1, 1, "big_normal_tree_stump", true, "Big Tree Stump")
sprites[44] = new Sprite(44, 0, 0.5, 1, 1, "big_dry_tree_stump", true, "Big Tree Stump")
sprites[45] = new Sprite(45, 1, 0.5, 0.5, 0.5, "regular_rock1", true, "Rock")
sprites[46] = new Sprite(46, 1, 0.5, 0.5, 0.5, "regular_rock2", true, "Rock")
sprites[47] = new Sprite(47, 0.5, 0.5, 0.5, 0.5, "regular_rock3", true, "Big Rock")
sprites[48] = new Sprite(48, 1, 0.5, 0.5, 0.5, "grass_rock1", true, "Grass Rock")
sprites[49] = new Sprite(49, 1, 0.5, 0.5, 0.5, "grass_rock2", true, "Grass Rock")
sprites[50] = new Sprite(50, 0.5, 0.5, 0.5, 0.5, "grass_rock3", true, "Big Grass Rock")
sprites[51] = new Sprite(51, 1, 0.5, 0.5, 0.5, "forest_rock1", true, "Forest Rock")
sprites[52] = new Sprite(52, 1, 0.5, 0.5, 0.5, "forest_rock2", true, "Forest Rock")
sprites[53] = new Sprite(53, 0.5, 0.5, 0.5, 0.5, "forest_rock3", true, "Big Forest Rock")
sprites[54] = new Sprite(54, 1, 0.5, 0.5, 0.5, "dark_forest_rock1", true, "Dark Forest Rock")
sprites[55] = new Sprite(55, 1, 0.5, 0.5, 0.5, "dark_forest_rock2", true, "Dark Forest Rock")
sprites[56] = new Sprite(56, 0.5, 0.5, 0.5, 0.5, "dark_forest_rock3", true, "Big Dark Forest Rock")
sprites[57] = new Sprite(57, 1, 0.5, 0.5, 0.5, "darker_forest_rock1", true, "Darker Forest Rock")
sprites[58] = new Sprite(58, 1, 0.5, 0.5, 0.5, "darker_forest_rock2", true, "Darker Forest Rock")
sprites[59] = new Sprite(59, 0.5, 0.5, 0.5, 0.5, "darker_forest_rock3", true, "Big Darker Forest Rock")
sprites[60] = new Sprite(60, 1, 0.5, 0.5, 0.5, "snowy_rock1", true, "Snowy Rock")
sprites[61] = new Sprite(61, 1, 0.5, 0.5, 0.5, "snowy_rock2", true, "Snowy Rock")
sprites[62] = new Sprite(62, 0.5, 0.5, 0.5, 0.5, "snowy_rock3", true, "Big Snowy Rock")
sprites[63] = new Sprite(63, 1, 0.5, 0.5, 0.5, "icy_rock1", true, "Icy Rock")
sprites[64] = new Sprite(64, 1, 0.5, 0.5, 0.5, "icy_rock2", true, "Icy Rock")
sprites[65] = new Sprite(65, 0.5, 0.5, 0.5, 0.5, "icy_rock3", true, "Big Icy Rock")
sprites[66] = new Sprite(66, 1, 0.5, 0.5, 0.5, "autumn_rock1", true, "Autumn Rock")
sprites[67] = new Sprite(67, 1, 0.5, 0.5, 0.5, "autumn_rock2", true, "Autumn Rock")
sprites[68] = new Sprite(68, 0.5, 0.5, 0.5, 0.5, "autumn_rock3", true, "Big Autumn Rock")
sprites[69] = new Sprite(69, 1, 0.5, 0.5, 0.5, "red_rock1", true, "Red Rock")
sprites[70] = new Sprite(70, 1, 0.5, 0.5, 0.5, "red_rock2", true, "Red Rock")
sprites[71] = new Sprite(71, 0.5, 0.5, 0.5, 0.5, "red_rock3", true, "Big Red Rock")
sprites[72] = new Sprite(72, 4, 4, 2, 2, "sand_pebble", false, "Sandy Pebble")
sprites[73] = new Sprite(73, 4, 4, 2, 2, "sand_pebbles", false, "Sandy Pebbles")
sprites[74] = new Sprite(74, 0.5, 0.5, 0.5, 0.5, "sand_footsteps1", false, "Sandy Footsteps")
sprites[75] = new Sprite(75, 0.5, 1, 0.5, 0.5, "sand_footsteps2", false, "Sandy Footsteps")
sprites[76] = new Sprite(76, 0, 0, 0, 0, "sand_path1", false, "Sandy Path")
sprites[77] = new Sprite(77, 0, 0, 0, 0, "sand_path2", false, "Sandy Path")
sprites[78] = new Sprite(78, 4, 4, 2, 2, "grass_pebble", false, "Grassy Pebble")
sprites[79] = new Sprite(79, 4, 4, 2, 2, "grass_pebbles", false, "Grassy Pebbles")
sprites[80] = new Sprite(80, 4, 3, 3, 2, "grass_leaves1", false, "Grassy Leaves")
sprites[81] = new Sprite(81, 4, 3, 3, 2, "grass_leaves2", false, "Grassy Leaves")
sprites[82] = new Sprite(82, 4, 4, 2, 2, "forest_pebble", false, "Forest Pebble")
sprites[83] = new Sprite(83, 4, 4, 2, 2, "forest_pebbles", false, "Forest Pebbles")
sprites[84] = new Sprite(84, 4, 3, 3, 2, "forest_leaves1", false, "Forest Leaves")
sprites[85] = new Sprite(85, 4, 3, 3, 2, "forest_leaves2", false, "Forest Leaves")
sprites[86] = new Sprite(86, 4, 4, 2, 2, "dark_forest_pebble", false, "Dark Forest Pebble")
sprites[87] = new Sprite(87, 4, 4, 2, 2, "dark_forest_pebbles", false, "Dark Forest Pebbles")
sprites[88] = new Sprite(88, 4, 3, 3, 2, "dark_forest_leaves1", false, "Dark Forest Leaves")
sprites[89] = new Sprite(89, 4, 3, 3, 2, "dark_forest_leaves2", false, "Dark Forest Leaves")
sprites[90] = new Sprite(90, 4, 4, 2, 2, "darker_forest_pebble", false, "Darker Forest Pebble")
sprites[91] = new Sprite(91, 4, 4, 2, 2, "darker_forest_pebbles", false, "Darker Forest Pebbles")
sprites[92] = new Sprite(92, 4, 3, 3, 2, "darker_forest_leaves1", false, "Darker Forest Leaves")
sprites[93] = new Sprite(93, 4, 3, 3, 2, "darker_forest_leaves2", false, "Darker Forest Leaves")
sprites[94] = new Sprite(94, 4, 4, 2, 2, "snowy_pebble", false, "Snowy Pebble")
sprites[95] = new Sprite(95, 4, 4, 2, 2, "snow_pebbles", false, "Snowy Pebbles")
sprites[96] = new Sprite(96, 5, 4, 2, 2, "snow_footsteps1", false, "Snowy Footsteps")
sprites[97] = new Sprite(97, 2, 2, 2, 3, "snow_footsteps2", false, "Snowy Footsteps")
sprites[98] = new Sprite(98, 4, 4, 2, 2, "icy_pebble", false, "Icy Pebble")
sprites[99] = new Sprite(99, 4, 4, 2, 2, "icy_pebbles", false, "Icy Pebbles")
sprites[100] = new Sprite(100, 5, 4, 2, 2, "icy_footsteps1", false, "Icy Footsteps")
sprites[101] = new Sprite(101, 2, 2, 2, 3, "icy_footsteps2", false, "Icy Footsteps")
sprites[102] = new Sprite(102, 4, 4, 2, 2, "dry_pebble", false, "Dry Pebble")
sprites[103] = new Sprite(103, 4, 4, 2, 2, "dry_pebbles", false, "Dry Pebbles")
sprites[104] = new Sprite(104, 4, 3, 3, 2, "dry_leaves1", false, "Dry Leaves")
sprites[105] = new Sprite(105, 4, 3, 3, 2, "dry_leaves2", false, "Dry Leaves")
sprites[106] = new Sprite(106, 4, 4, 2, 2, "burnt_pebble", false, "Burnt Pebble")
sprites[107] = new Sprite(107, 4, 4, 2, 2, "burnt_pebbles", false, "Burnt Pebbles")
sprites[108] = new Sprite(108, 4, 3, 3, 2, "burnt_leaves1", false, "Burnt Leaves")
sprites[109] = new Sprite(109, 4, 3, 3, 2, "burnt_leaves2", false, "Burnt Leaves")
sprites[117] = new Sprite(117, 0, 0, 0, 0, "selector_icon", false, "Selector")
sprites[118] = new Sprite(118, 0, 0.75, 0.75, 0.75, "cold_tree1", true, "Cold Tree")
sprites[119] = new Sprite(119, 0, 0.9, 0.75, 0.75, "cold_tree2", true, "Cold Tree")
sprites[120] = new Sprite(120, 0, 0.5, 0.5, 0.5, "cold_tree3", true, "Cold Tree")
sprites[121] = new Sprite(121, 0, 0.75, 0.75, 0.75, "snowy_cold_tree1", true, "Snowy Cold Tree")
sprites[122] = new Sprite(122, 0, 0.9, 0.75, 0.75, "snowy_cold_tree2", true, "Snowy Cold Tree")
sprites[123] = new Sprite(123, 0, 0.5, 0.5, 0.5, "snowy_cold_tree3", true, "Snowy Cold Tree")
sprites[124] = new Sprite(124, 1, 0.5, 0.5, 0.5, "cold_rock1", true, "Cold Rock")
sprites[125] = new Sprite(125, 1, 0.5, 0.5, 0.5, "cold_rock2", true, "Cold Rock")
sprites[126] = new Sprite(126, 0.5, 0.5, 0.5, 0.5, "cold_rock3", true, "Big Cold Rock")
sprites[127] = new Sprite(127, 4, 3, 3, 2, "cold_leaves1", false, "Cold Leaves")
sprites[128] = new Sprite(128, 4, 3, 3, 2, "cold_leaves2", false, "Cold Leaves")
sprites[129] = new Sprite(129, 4, 3, 3, 2, "dead_leaves1", false, "Dead Leaves")
sprites[130] = new Sprite(130, 4, 3, 3, 2, "dead_leaves2", false, "Dead Leaves")

function getImageCoords(itemID) {
    return {
        sx: (itemID % SPRITESHEET_WIDTH) * PIXELS_WIDTH,
        sy: Math.floor(itemID / SPRITESHEET_WIDTH) * PIXELS_HEIGHT
    }
}

