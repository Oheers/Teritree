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
            image-rendering: pixelated;
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
    <p><span id="tick-preview">{time}ms</span></p>
</div>
<canvas oncontextmenu="return false;" id="viewport" width=700px height=500px tabindex='1'></canvas>

<script src="input-handler.js"></script>
<script src="render-engine.js"></script>
<script src="terrain-compressor.js"></script>
<script src="terrain-generator.js"></script>
<script src="controller.js"></script>
</body>
</html>