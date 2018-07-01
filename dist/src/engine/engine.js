"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var terrain_1 = require("./terrain/terrain");
var camera_1 = require("./camera");
var input_1 = require("./input");
var Point = /** @class */ (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    return Point;
}());
exports.Point = Point;
var ChunkPos = /** @class */ (function () {
    function ChunkPos(i, j) {
        this.i = i;
        this.j = j;
    }
    return ChunkPos;
}());
exports.ChunkPos = ChunkPos;
var Engine = /** @class */ (function () {
    function Engine() {
        var _this = this;
        this.movementSpeed = 900;
        this.tiles = [];
        this.buildings = [];
        this.lastTime = (new Date()).getTime();
        this.currentTime = 0;
        this.delta = 0;
        this.tileWidth = 16;
        this.gameObjects = [];
        this.gameContainer = document.createElement('div');
        this.terrainCanvas = document.createElement('canvas');
        this.terrainCtx = this.terrainCanvas.getContext('2d');
        this.terrainCanvas.height = window.innerHeight;
        this.terrainCanvas.width = window.innerWidth;
        this.gameContainer.appendChild(this.terrainCanvas);
        this.input = new input_1.Input();
        this.input.register();
        this.camera = new camera_1.Camera();
        this.camera.setPos(500, 100);
        this.terrain = new terrain_1.Terrain(this.terrainCtx, this.camera, this.tiles, 500, 500);
        this.gameObjects.push(this.terrain);
        this.gameObjects.push(this.input);
        this.terrainCanvas.onmousedown = function (event) {
            var rect = _this.terrainCanvas.getBoundingClientRect();
            _this.click(event.clientX - rect.left, event.clientY - rect.top);
        };
        document.body.appendChild(this.gameContainer);
    }
    Engine.prototype.init = function () {
        for (var _i = 0, _a = this.gameObjects; _i < _a.length; _i++) {
            var go = _a[_i];
            go.preInit();
        }
        for (var _b = 0, _c = this.gameObjects; _b < _c.length; _b++) {
            var go = _c[_b];
            go.init(this);
        }
        for (var _d = 0, _e = this.gameObjects; _d < _e.length; _d++) {
            var go = _e[_d];
            go.postInit();
        }
    };
    Engine.chunkForPixel = function (x, y) {
        var xMod = x % (terrain_1.Terrain.tileSize * 2);
        var yMod = y % terrain_1.Terrain.tileSize;
        var xOff = (yMod / terrain_1.Terrain.tileSize) * (terrain_1.Terrain.tileSize);
        var yOff = (xMod / (terrain_1.Terrain.tileSize * 2)) * terrain_1.Terrain.tileSize * 0.5;
        return {
            i: Math.floor((x - xOff) / (terrain_1.Terrain.tileSize * 2)),
            j: Math.floor((y - yOff) / (terrain_1.Terrain.tileSize))
        };
    };
    Engine.prototype.addTile = function (tile) {
        this.tiles.push(tile);
    };
    Engine.prototype.start = function () {
        window.requestAnimationFrame(this.render.bind(this));
    };
    Engine.prototype.click = function (x, y) {
        var pos = {
            x: x + this.camera.getPos().x,
            y: y + this.camera.getPos().y
        };
        var cord = Engine.chunkForPixel(pos.x, pos.y);
        console.log("Click coord", cord);
        var nextTileId = (this.terrain.getTileId(cord.i, cord.j) + 1) % 3;
        //     const nextTileCount = this.tiles[nextTileId].length;
        this.terrain.setTileId(cord.i, cord.j, nextTileId);
    };
    Engine.prototype.render = function () {
        window.requestAnimationFrame(this.render.bind(this));
        this.currentTime = (new Date()).getTime();
        this.delta = (this.currentTime - this.lastTime) / 1000;
        this.lastTime = this.currentTime;
        this.update();
        this.terrainCtx.fillStyle = "black";
        this.terrainCtx.fillRect(0, 0, this.terrainCanvas.width, this.terrainCanvas.height);
        this.terrainCtx.save();
        this.terrainCtx.translate(-this.camera.x, -this.camera.y);
        for (var _i = 0, _a = this.gameObjects; _i < _a.length; _i++) {
            var go = _a[_i];
            go.preRender();
        }
        for (var _b = 0, _c = this.gameObjects; _b < _c.length; _b++) {
            var go = _c[_b];
            go.render(this.terrainCtx);
        }
        for (var _d = 0, _e = this.gameObjects; _d < _e.length; _d++) {
            var go = _e[_d];
            go.postRender();
        }
        this.terrainCtx.restore();
        //this.terrainCtx.fillStyle = "green";
        //this.terrainCtx.fillText("FPS: " + Math.round(1 / this.delta), 20, 20);
        //  console.log( Math.round(1 / this.delta));
        //this.terrainCtx.stroke();
    };
    Engine.prototype.update = function () {
        if (this.input.isDown(input_1.InputSequence.UP)) {
            this.camera.setPos(this.camera.x, -(this.movementSpeed * this.delta) + this.camera.y);
        }
        if (this.input.isDown(input_1.InputSequence.DOWN)) {
            this.camera.setPos(this.camera.x, (this.movementSpeed * this.delta) + this.camera.y);
        }
        if (this.input.isDown(input_1.InputSequence.LEFT)) {
            this.camera.setPos(-(this.movementSpeed * this.delta) + this.camera.x, this.camera.y);
        }
        if (this.input.isDown(input_1.InputSequence.RIGHT)) {
            this.camera.setPos((this.movementSpeed * this.delta) + this.camera.x, this.camera.y);
        }
        for (var _i = 0, _a = this.gameObjects; _i < _a.length; _i++) {
            var go = _a[_i];
            go.preUpdate();
        }
        for (var _b = 0, _c = this.gameObjects; _b < _c.length; _b++) {
            var go = _c[_b];
            go.update();
        }
        for (var _d = 0, _e = this.gameObjects; _d < _e.length; _d++) {
            var go = _e[_d];
            go.postUpdate();
        }
    };
    return Engine;
}());
exports.Engine = Engine;
//# sourceMappingURL=engine.js.map