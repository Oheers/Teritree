class Item {

    constructor(name, color, colorID) {
        this._color = color;
        this._name = name;
        this._colorID = colorID;
    }

    get name() {
        return this._name;
    }

    get color() {
        return this._color;
    }

    get colorID() {
        return this._colorID;
    }
}

const colors = [
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

let item = colors[1];
const indicator = document.getElementById("color-indicator");

function setColor(id) {
    item = colors[id-1];
    indicator.style.backgroundColor = item.color;
}