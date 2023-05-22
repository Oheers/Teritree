<!DOCTYPE html>
<html lang="en">
<head>
    <title>Default page</title>
    <link rel="icon" type="image/x-icon" href="https://hpanel.hostinger.com/favicons/hostinger.png">
    <meta charset="utf-8">
    <meta content="IE=edge,chrome=1" http-equiv="X-UA-Compatible">
    <meta content="Default page" name="description">
    <meta content="width=device-width, initial-scale=1" name="viewport">

    <style>
        body {
            margin: 0;
            overflow: hidden;
        }
    </style>
</head>
<body>
    <canvas id="viewport" tabindex='1'></canvas>

    <script>
        let grassBackground;
        var focused = true;
        window.addEventListener('keydown', keyDownProcessor, false)
        window.addEventListener('keyup', keyUpProcessor, false)
        window.addEventListener("blur", onBlur, false);
        window.addEventListener("focus", onFocus, false);
        backgroundRegister = []
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
            for (let x=-1; x*100 < window.innerWidth+100; x++) {
                for (let y=-1; y*100 < window.innerHeight+100; y++) {
                    backgroundRegister.push(new BackgroundElement(100, 100, "rgb("+(155+Math.floor(Math.random()*100))+", "+(255+Math.floor(Math.random()*25))+", "+(155+Math.floor(Math.random()*100))+")", x*100, y*100));
                }
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

        function fetchKeyPress() {
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
            backgroundRegister.forEach(function(backgroundElement) {
                backgroundElement.translate(x, y);
            });
        }

        function BackgroundElement(width, height, colour, x, y) {
            this.width = width;
            this.height = height;
            this.x = x;
            this.y = y;
            this.update = function() {
                const ctx = viewportArea.context;
                ctx.fillStyle = colour;
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
            this.translate = function (x, y) {
                this.x += x;
                this.y += y;
            }
        }

        function updateViewport() {
            viewportArea.clear();
            fetchKeyPress();
            backgroundRegister.forEach(function(backgroundElement) {
                backgroundElement.update();
            });
        }

        startGame();
    </script>
</body>
</html>