class RenderEngine {

    constructor() {
        this.focused = true;

        this.fetchRealCanvasResolution();

        this.viewportArea = {
            canvas: document.getElementById("viewport"),
            start: function () {
                this.canvas.width = 1920;
                this.canvas.height = 1080;
                this.context = this.canvas.getContext("2d");
                this.context.imageSmoothingEnabled = false;
                this.context.imageSmoothingQuality = "low";
                setInterval(updateViewport, 2);
            },
            clear: function () {
                this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        };

        this.onResize = this.onResize.bind(this);

        window.addEventListener("blur", this.onBlur, false);
        window.addEventListener("focus", this.onFocus, false);
        window.addEventListener("resize", this.onResize, false);
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

    onResize() {
        this.fetchRealCanvasResolution()
    }

    fetchRealCanvasResolution() {
        if (window.innerWidth * 9 / 16 < window.innerHeight) {
            this._gameHeight = window.innerWidth * 9 / 16;
        } else {
            this._gameHeight = window.innerHeight;
        }
        // window.innerWidth / 19.2 is the number of pixels per square. 19.2 pixels are rendered horizontally on any monitor.
        this._verticalZoomLevel = this._gameHeight * (100 / (window.innerWidth / 19.2));
    }

    get isFocus() {
        return this.focused;
    }

    get viewport() {
        return this.viewportArea;
    }

    get gameHeight() {
        return this._gameHeight;
    }

    get verticalZoomLevel() {
        return this._verticalZoomLevel;
    }
}