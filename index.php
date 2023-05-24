<!DOCTYPE html>
<html lang="en">
<head>
    <title>Default page</title>
    <link rel="icon" type="image/x-icon" href="https://hpanel.hostinger.com/favicons/hostinger.png">
    <link rel="preload" href="CozetteVector-Regular.woff2" as="font" type="font/woff2" crossorigin>
    <meta charset="utf-8">
    <meta content="IE=edge,chrome=1" http-equiv="X-UA-Compatible">
    <meta content="Default page" name="description">
    <meta content="width=device-width, initial-scale=1" name="viewport">

    <style>
        body {
            margin: 0;
            overflow: hidden;
        }

        canvas {
            position: relative;
        }

        @font-face {
            font-family: 'CozetteVector';
            src: url("CozetteVector-Regular.woff2");
        }

        .location {
            position: absolute;
            margin: 1%;
            font-family: 'CozetteVector', Arial, serif;
            font-size: 24px;
            padding: 0.025% 1.75%;
            background-color: rgb(200, 200, 200, 0.4);
            z-index: 1;
        }

        .location span {
            color: black;
        }
    </style>
</head>
<body>

    <div class="location">
        <p><span id="location-preview">X: ${x} Y: ${y}</span></p>
        <p><span id="mouse-preview">X: ${x} Y: ${y}</span></p>
    </div>
    <canvas id="viewport" tabindex='1'></canvas>

    <script>
        let grassBackground;
        var focused = true;
        var scaledSquareSize = window.innerWidth / 20;
        var camCentreX = 0;
        var camCentreY = 0;
        var mouseX = 0;
        var mouseY = 0;
        var lastUpdated = Date.now();
        window.addEventListener('keydown', keyDownProcessor, false)
        window.addEventListener('keyup', keyUpProcessor, false)
        window.addEventListener("blur", onBlur, false);
        window.addEventListener("focus", onFocus, false);
        window.addEventListener("mousemove", onMouseMove, false);
        window.addEventListener("mousedown", onMouseUp, false);
        backgroundRegister = []
        const coordinateTracker = document.getElementById("location-preview")
        const mouseTracker = document.getElementById("mouse-preview")
        var activeTile = null;
        var keyMap = {};
        const viewportArea = {
            canvas: document.getElementById("viewport"),
            start: function () {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
                this.context = this.canvas.getContext("2d");
                this.interval = setInterval(updateViewport, 20);
            },
            clear: function () {
                this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        };

        function startGame() {
            viewportArea.start();
            for (let x=-1; x*scaledSquareSize < window.innerWidth+scaledSquareSize; x++) {
                const xIndex = [];
                for (let y=-1; y*scaledSquareSize < window.innerHeight+scaledSquareSize; y++) {
                    xIndex[y] = (new BackgroundElement(scaledSquareSize, scaledSquareSize, "rgb("+(155+Math.floor(Math.random()*100))+", "+
                        (255+Math.floor(Math.random()*25))+", "+(155+Math.floor(Math.random()*100))+")", x*scaledSquareSize, y*scaledSquareSize));
                }
                backgroundRegister[x] = xIndex;
            }
        }

        function keyDownProcessor(event) {
            var event = window.event || event;
            keyMap[event.keyCode] = true;
        }

        function keyUpProcessor(event) {
            var event = window.event || event;
            keyMap[event.keyCode] = false;
        }

        function onBlur() {
            focused = false;
            keyMap = {};
        }

        function onFocus() {
            focused = true;
        }

        function onMouseMove(event) {
            mouseX = event.clientX + (camCentreX*scaledSquareSize);
            mouseY = event.clientY - (camCentreY*scaledSquareSize);
        }

        function onMouseUp() {
            tileX = Math.floor(mouseX/scaledSquareSize);
            tileY = Math.floor(mouseY/scaledSquareSize);
            try {
                backgroundRegister[tileX][tileY].highlight();
            } catch (error) {

            }
        }

        function fetchKeyPress(timeDiff) {
            if (!focused) return;
            let x = 0, y = 0;
            if (keyMap[87]) y = 3; // W
            if (keyMap[65]) x = 3; // A
            if (keyMap[83]) y += -3 // S
            if (keyMap[68]) x += -3 // D
            if (keyMap[16]) {
                x = x * 2;
                y = y * 2;
            }
            x *= (timeDiff / 50);
            y *= (timeDiff / 50);
            camCentreX += (-(x / scaledSquareSize));
            camCentreY += (y / scaledSquareSize);
            mouseX -= (x);
            mouseY -= (y);
            backgroundRegister.forEach(function(xRegister) {
                xRegister.forEach(function(backgroundElement) {
                    backgroundElement.translate(x, y);
                });
            });
            lastUpdated = Date.now();
        }

        function BackgroundElement(width, height, originalColour, x, y) {
            this.width = width;
            this.height = height;
            this.originalColour = originalColour;
            this.newColour = "red";
            this.x = x;
            this.y = y;
            this.update = function() {
                const ctx = viewportArea.context;
                if (activeTile === this) {
                    ctx.fillStyle = this.newColour;
                } else {
                    ctx.fillStyle = this.originalColour;
                }
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
            this.translate = function (x, y) {
                this.x += x;
                this.y += y;
            }
            this.highlight = function () {
                this.originalColour = "orange";
                console.log(this.originalColour);
            }
        }

        function updateCoordinateTracker() {
            coordinateTracker.innerHTML = "[Camera] X: "+ (Math.round(camCentreX*2)/2).toFixed(1) +" Y: "+ (Math.round(camCentreY*2)/2).toFixed(1);
            mouseTracker.innerHTML = "[Mouse] X: "+ (Math.round(mouseX*2)/2).toFixed(1) +" Y: "+ (Math.round(mouseY*2)/2).toFixed(1);
        }

        function selectTile() {
            tileX = Math.floor(mouseX/scaledSquareSize);
            tileY = Math.floor(mouseY/scaledSquareSize);
            try {
                activeTile = backgroundRegister[tileX][tileY];
            } catch (error) {

            }
        }

        function updateViewport() {
            viewportArea.clear();
            var diff = Date.now() - lastUpdated;
            fetchKeyPress(diff);
            selectTile();
            updateCoordinateTracker();
            backgroundRegister.forEach(function(xIndex) {
                xIndex.forEach(function(backgroundElement) {
                    backgroundElement.update();
                });
            });
        }

        startGame();
    </script>
</body>
</html>