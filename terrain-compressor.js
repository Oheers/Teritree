class VectorPoint {
    constructor(_pointX, _pointY) {
        this.pointX = _pointX;
        this.pointY = _pointY;
    }

    get x() {
        return this.pointX
    }

    get y() {
        return this.pointY;
    }

    translate(_x, _y) {
        this.pointX += _x;
        this.pointY += _y;
    }
}

class BackgroundPolygon {

    constructor(_colour, _originX, _originY) {
        this.points = [];
        this.origin = new VectorPoint(_originX, _originY);
        this.colour = _colour;
    }

    addPoint(pointX, pointY) {
        this.points.push(new VectorPoint(pointX, pointY))
    }

    draw() {
        const ctx = renderer.viewportArea.context;
        ctx.beginPath();
        ctx.moveTo(this.origin.x, this.origin.y);
        this.points.forEach(point => {
            ctx.lineTo(point.x, point.y);
        })
        ctx.closePath();
        ctx.stroke();
    }

    translate(x, y) {
        this.points.forEach(point => {
            point.translate(x, y);
        })
    }
}

class TerrainCompressor {

    constructor(_map, _scaledSquareSize) {
        this.unprocessedMap = _map;
        this.scaledSquareSize = _scaledSquareSize;
        this.resultMap = [];
    }

    fetch() {
        this.unprocessedMap.forEach(tileRow => {
            tileRow.forEach(tile => {
                if (this.isSurrounded(this.getSurroundings(tile))) {
                    const tilePolygon = new BackgroundPolygon(tile.getX, tile.getY);
                    tilePolygon.addPoint(tile.getX, tile.getY + this.scaledSquareSize);
                    tilePolygon.addPoint(tile.getX + this.scaledSquareSize, tile.getY + this.scaledSquareSize);
                    tilePolygon.addPoint(tile.getX + this.scaledSquareSize, tile.getY);
                    tilePolygon.addPoint(tile.getX, tile.getY);
                    this.resultMap.push(tilePolygon);
                }
            })
        })
    }

    render() {
        this.resultMap.forEach(polygon => {
            polygon.draw();
        })
    }

    translateCompression(x, y) {
        this.resultMap.forEach(vector => {
            vector.translate(x, y);
        })
    }

    getSurroundings(tile) {
        let tileX = tile.getX / this.scaledSquareSize;
        let tileY = tile.getY / this.scaledSquareSize;
        let [W, S, E, N] = [null, null, null, null];

        try {
            W = this.unprocessedMap[tileX - 1][tileY];
        } catch (npe) {
        }
        try {
            S = this.unprocessedMap[tileX][tileY + 1];
        } catch (npe) {
        }
        try {
            E = this.unprocessedMap[tileX + 1][tileY];
        } catch (npe) {
        }
        try {
            N = this.unprocessedMap[tileX][tileY - 1];
        } catch (npe) {
        }

        return {
            'W': W == null || W.getCurrentColour === tile.getCurrentColour,
            'S': S == null || S.getCurrentColour === tile.getCurrentColour,
            'E': E == null || E.getCurrentColour === tile.getCurrentColour,
            'N': N == null || N.getCurrentColour === tile.getCurrentColour
        };
    }
    isSurrounded(surroundings) {
        return (surroundings['W'] && surroundings['S'] && surroundings['E'] && surroundings['N'])
    }
}