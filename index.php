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
    <canvas id="viewport"></canvas>

    <script>
        let grassBackground;
        backgroundRegister = []
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
            for (let x=-1; x*65 < window.innerWidth+65; x++) {
                for (let y=-1; y*65 < window.innerHeight+65; y++) {
                    backgroundRegister.push(new BackgroundElement(65, 65, "rgb("+(255-(x*9))+", "+(255-(x*14))+", "+(50+(y*10))+")", x*65, y*65));
                }
            }
            console.log(backgroundRegister);
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
        }

        function updateViewport() {
            viewportArea.clear();
            backgroundRegister.forEach(function(backgroundElement) {
                backgroundElement.update();
            });
        }

        startGame();
    </script>
</body>
</html>