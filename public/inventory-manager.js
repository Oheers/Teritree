class Item {

    constructor(name, colour, colourID) {
        this._colour = colour;
        this._name = name;
        this._colourID = colourID;
    }

    get name() {
        return this._name;
    }

    get colour() {
        return this._colour;
    }

    get colourID() {
        return this._colourID;
    }
}

const colours = [
    new Item("Red", "red", 1),
    new Item("Orange", "#fecc02", 2),
    new Item("Yellow", "yellow", 3),
    new Item("Lime", "lime", 4),
    new Item("Green", "green", 5),
    new Item("Aqua", "aqua", 6),
    new Item("Blue", "#006aa7", 7),
    new Item("Black", "black", 8),
    new Item("Gray", "gray", 9),
    new Item("White", "white", 10),
    new Item("Purple", "#cc00ff", 11)
]

let item = colours[1];
const indicator = document.getElementById("color-indicator");

function setColour(id) {
    item = colours[id-1];
    //renderer.uiMap["selector"].setColour(id);
    indicator.style.backgroundColor = item.colour;
}