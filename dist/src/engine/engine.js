"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var terrain_1 = require("./terrain/terrain");
var camera_1 = require("./camera");
var Point = /** @class */ (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    return Point;
}());
exports.Point = Point;
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
        this.gameContainer = document.createElement('div');
        this.terrainCanvas = document.createElement('canvas');
        this.terrainCtx = this.terrainCanvas.getContext('2d');
        this.terrainCanvas.height = 768;
        this.terrainCanvas.width = 1024;
        this.gameContainer.style.height = "768px";
        this.gameContainer.style.width = "1024px";
        this.gameContainer.appendChild(this.terrainCanvas);
        document.body.addEventListener("keydown", function (event) {
            console.log("KeyDown", event);
            if (event.key == "s") {
                _this.camera.setPos(_this.camera.x, (_this.movementSpeed * _this.delta) + _this.camera.y);
            }
            if (event.key == "a") {
                _this.camera.setPos(-(_this.movementSpeed * _this.delta) + _this.camera.x, _this.camera.y);
            }
            if (event.key == "w") {
                _this.camera.setPos(_this.camera.x, -(_this.movementSpeed * _this.delta) + _this.camera.y);
            }
            if (event.key == "d") {
                _this.camera.setPos((_this.movementSpeed * _this.delta) + _this.camera.x, _this.camera.y);
            }
        }, false);
        this.camera = new camera_1.Camera();
        this.camera.setPos(500, 100);
        this.terrain = new terrain_1.Terrain(this.terrainCtx, this.camera, this.tiles, 500, 500);
        this.terrainCanvas.onmousedown = function (event) {
            var rect = _this.terrainCanvas.getBoundingClientRect();
            _this.click(event.clientX - rect.left, event.clientY - rect.top);
        };
        document.body.appendChild(this.gameContainer);
    }
    Engine.isoTo2D = function (pt) {
        var tempPt = new Point(0, 0);
        tempPt.x = (2 * pt.y + pt.x) / 2;
        tempPt.y = (2 * pt.y - pt.x) / 2;
        return (tempPt);
    };
    Engine.twoDToIso = function (pt) {
        var tempPt = new Point(0, 0);
        tempPt.x = pt.x - pt.y;
        tempPt.y = (pt.x + pt.y) / 2;
        return (tempPt);
    };
    Engine.getTileCoordinates = function (pt, tileHeight) {
        var tempPt = new Point(0, 0);
        tempPt.x = Math.floor(pt.x / tileHeight);
        tempPt.y = Math.floor(pt.y / tileHeight);
        return (tempPt);
    };
    Engine.get2dFromTileCoordinates = function (pt, tileHeight) {
        var tempPt = new Point(0, 0);
        tempPt.x = pt.x * tileHeight;
        tempPt.y = pt.y * tileHeight;
        return (tempPt);
    };
    Engine.prototype.addTile = function (tile) {
        this.tiles.push(tile);
    };
    Engine.prototype.start = function () {
        window.requestAnimationFrame(this.render.bind(this));
    };
    Engine.prototype.click = function (x, y) {
        var pos = {
            x: x - this.camera.getPos().x,
            y: y - this.camera.getPos().x
        };
        var cord = Engine.getTileCoordinates(Engine.isoTo2D(pos), this.tileWidth);
        //
        // const nextTileId = this.levelData[cord.x][cord.y].tileID + 1;
        // const nextTileCount = this.tiles[nextTileId].length;
        //
        // this.levelData[cord.x][cord.y].tileID = nextTileId;
        // this.levelData[cord.x][cord.y].height = 1;
        // this.levelData[cord.x][cord.y].dirty = true;
    };
    Engine.prototype.render = function () {
        window.requestAnimationFrame(this.render.bind(this));
        this.currentTime = (new Date()).getTime();
        this.delta = (this.currentTime - this.lastTime) / 1000;
        this.terrainCtx.fillStyle = "black";
        this.terrainCtx.fillRect(0, 0, this.terrainCanvas.width, this.terrainCanvas.height);
        this.terrainCtx.save();
        this.terrainCtx.translate(-this.camera.x, -this.camera.y);
        this.terrain.render();
        this.terrainCtx.restore();
        this.terrainCtx.fillStyle = "green";
        this.terrainCtx.fillText("FPS: " + Math.round(1 / this.delta), 20, 20);
        //this.terrainCtx.stroke();
        this.lastTime = this.currentTime;
    };
    return Engine;
}());
exports.Engine = Engine;
//# sourceMappingURL=engine.js.map