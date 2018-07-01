"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var terrain_1 = require("./terrain/terrain");
var camera_1 = require("./camera");
var input_1 = require("./input");
var gui_1 = require("../gui/gui");
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
    function Engine(resourceManager) {
        this.resourceManager = resourceManager;
        this.movementSpeed = 900;
        this.tiles = [];
        this.buildings = [];
        this.lastTime = (new Date()).getTime();
        this.currentTime = 0;
        this.delta = 0;
        this.tileWidth = 16;
        this.gameObjects = [];
        this._gameContainer = document.createElement('div');
        this.terrainCanvas = document.createElement('canvas');
        this.terrainCtx = this.terrainCanvas.getContext('2d');
        this.terrainCanvas.height = window.innerHeight;
        this.terrainCanvas.width = window.innerWidth;
        if (window.innerWidth < 1280) {
            this.terrainCanvas.width = 1024;
        }
        else if (window.innerWidth < 1360) {
            this.terrainCanvas.width = 1280;
        }
        else if (window.innerWidth < 1366) {
            this.terrainCanvas.width = 1360;
        }
        else if (window.innerWidth < 1440) {
            this.terrainCanvas.width = 1366;
        }
        else if (window.innerWidth < 1600) {
            this.terrainCanvas.width = 1440;
        }
        else if (window.innerWidth < 1680) {
            this.terrainCanvas.width = 1600;
        }
        else if (window.innerWidth < 1920) {
            this.terrainCanvas.width = 1680;
        }
        else if (window.innerWidth < 2560) {
            this.terrainCanvas.width = 1920;
        }
        else {
            this.terrainCanvas.width = 2560;
        }
        this.gameContainer.style.width = this.terrainCanvas.width + "px";
        this.gameContainer.style.position = "relative";
        this._gameContainer.appendChild(this.terrainCanvas);
        this._input = new input_1.Input();
        this._input.register(this.terrainCanvas);
        this.camera = new camera_1.Camera();
        this.camera.setPos(500, 100);
        this._terrain = new terrain_1.Terrain(this.terrainCtx, this.camera, this.tiles, 500, 500);
        this.gameObjects.push(this._terrain);
        this.gameObjects.push(this._input);
        this.gameObjects.push(new gui_1.Gui());
        document.body.appendChild(this._gameContainer);
    }
    Object.defineProperty(Engine.prototype, "terrain", {
        get: function () {
            return this._terrain;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Engine.prototype, "input", {
        get: function () {
            return this._input;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Engine.prototype, "gameContainer", {
        get: function () {
            return this._gameContainer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Engine.prototype, "gameWidth", {
        get: function () {
            return this.terrainCanvas.width;
        },
        enumerable: true,
        configurable: true
    });
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
    Engine.prototype.addTile = function (tile) {
        this.tiles.push(tile);
    };
    Engine.prototype.start = function () {
        window.requestAnimationFrame(this.render.bind(this));
    };
    Engine.prototype.click = function (x, y) {
        //
        // console.log("Click coord", cord);
        // const nextTileId = (this.terrain.getTileId(cord.i, cord.j) + 1) % 3;
        // //     const nextTileCount = this.tiles[nextTileId].length;
        //
        // this.terrain.setTileId(cord.i, cord.j, nextTileId);
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
        if (this._input.isDown(input_1.InputSequence.UP)) {
            this.camera.setPos(this.camera.x, -(this.movementSpeed * this.delta) + this.camera.y);
        }
        if (this._input.isDown(input_1.InputSequence.DOWN)) {
            this.camera.setPos(this.camera.x, (this.movementSpeed * this.delta) + this.camera.y);
        }
        if (this._input.isDown(input_1.InputSequence.LEFT)) {
            this.camera.setPos(-(this.movementSpeed * this.delta) + this.camera.x, this.camera.y);
        }
        if (this._input.isDown(input_1.InputSequence.RIGHT)) {
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