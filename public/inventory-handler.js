class Item {

    constructor(name, color) {
        this._color = color;
        this._name = name;
    }

    get name() {
        return this._name;
    }

    get color() {
        return this._color;
    }
}

const colors = [
    new Item("Red", "red"),
    new Item("Orange", "#FECC02"),
    new Item("Yellow", "yellow"),
    new Item("Lime", "lime"),
    new Item("Green", "green"),
    new Item("Aqua", "aqua"),
    new Item("Blue", "#006AA7"),
    new Item("Black", "black"),
    new Item("Gray", "gray"),
    new Item("White", "white"),
    new Item("Purple", "#cc00ff")
]

let item = colors[1];
const indicator = document.getElementById("color-indicator");

function setColor(id) {
    item = colors[id-1];
    indicator.style.backgroundColor = item.color;
}