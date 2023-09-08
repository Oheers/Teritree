class RenderEngine {

    constructor() {
        this.focused = true;
        this.iWidth = window.innerWidth;
        this.iHeight = window.innerHeight;

        console.log(this.iWidth);
        console.log(this.iHeight);

        this.viewportArea = {
            canvas: document.getElementById("viewport"),
            start: function () {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
                this.context = this.canvas.getContext("2d");
                this.context.imageSmoothingEnabled = false;
                this.context.imageSmoothingQuality = "low";
                setInterval(updateViewport, 2);
            },
            clear: function () {
                this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        };
        window.addEventListener("blur", this.onBlur, false);
        window.addEventListener("focus", this.onFocus, false);
    }

    translate(x, y) {
        for (const rowKey in terrain.terrainMap) {
            if (terrain.terrainMap.hasOwnProperty(rowKey)) {
                const row = terrain.terrainMap[rowKey];
                for (const colKey in row) {
                    if (row.hasOwnProperty(colKey)) {
                        row[colKey].translate(x, y)
                    }
                }
            }
        }
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

    get initialWidth() {
        return this.iWidth;
    }

    get initialHeight() {
        return this.iHeight;
    }
}