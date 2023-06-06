class RenderEngine {

    constructor() {
        this.focused = true;

        this.viewportArea = {
            canvas: document.getElementById("viewport"),
            start: function () {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
                this.context = this.canvas.getContext("2d");
                setInterval(updateViewport, 20);
            },
            clear: function () {
                this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        };
        window.addEventListener("blur", this.onBlur, false);
        window.addEventListener("focus", this.onFocus, false);
    }

    translate(x, y) {
        terrain.terrainMap.forEach(function(xRegister) {
            xRegister.forEach(function(backgroundElement) {
                backgroundElement.translate(x, y);
            });
        });
    }

    onBlur() {
        this.focused = false;
        inputHandler.clearKeyMap();
    }

    onFocus() {
        this.focused = true;
    }

    get isFocus() {
        return this.focused;
    }

    get viewport() {
        return this.viewportArea;
    }
}