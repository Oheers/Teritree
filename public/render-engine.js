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
                setInterval(updateViewport, 10);
            },
            clear: function () {
                this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        };

        this.onResize = this.onResize.bind(this);

        this.uiMap = {};
        this.createSelector();
        this._viewDebugType = "normal";

        window.addEventListener("blur", this.onBlur, false);
        window.addEventListener("focus", this.onFocus, false);
        window.addEventListener("resize", this.onResize, false);
    }

    translate(x, y, map) {
        for (const rowKey in map) {
            if (map.hasOwnProperty(rowKey)) {
                const row = map[rowKey];
                for (const colKey in row) {
                    if (row.hasOwnProperty(colKey)) {
                        row[colKey].translate(x, y)
                    }
                }
            }
        }
    }

    translateUI(x, y, map) {
        for (const element in map) {
            map[element].translate(x, y);
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

    createSelector() {
        this.uiMap["selector"] ??= new UiElementSprite(100, 100, 0, 0, 117);
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


    get viewDebugType() {
        return this._viewDebugType;
    }

    set viewDebugType(value) {
        this._viewDebugType = value;
    }
}