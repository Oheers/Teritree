<!DOCTYPE html>
<html lang="en">
<head>
    <title>Teritree</title>
    <link rel="icon" type="image/x-icon" href="favicon.png">
    <meta charset="utf-8">
    <meta content="IE=edge,chrome=1" http-equiv="X-UA-Compatible">
    <meta content="Teritree" name="description">
    <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
    <link href="styles.css" rel="stylesheet" type="text/css" media="screen">
</head>
<body oncontextmenu="return false;">

<div class="location">
    <p><span id="location-preview">X: ${x} Y: ${y}</span></p>
    <p><span id="mouse-preview">X: ${x} Y: ${y}</span></p>
    <p><span id="tick-preview">{time}ms</span></p>
</div>
<div class="color-indicator" id="color-indicator"></div>
<canvas id="viewport" width=700px height=500px tabindex='1'></canvas>

<script src="input-handler.js"></script>
<script src="render-engine.js"></script>
<script src="random-seed.js"></script>
<script src="terrain-generator.js"></script>
<script src="inventory-handler.js"></script>
<script src="controller.js"></script>
</body>
</html>