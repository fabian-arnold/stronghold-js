"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var canvas_util_1 = require("../util/canvas-util");
var strongholdjs;
(function (strongholdjs) {
    var Point = /** @class */ (function () {
        function Point(x, y) {
            this.x = x;
            this.y = y;
        }
        return Point;
    }());
    strongholdjs.Point = Point;
    var LevelTile = /** @class */ (function () {
        function LevelTile() {
        }
        return LevelTile;
    }());
    var Engine = /** @class */ (function () {
        function Engine() {
            var _this = this;
            this.levelData = null;
            this.tiles = [];
            this.buildings = [];
            this.tileWidth = 16;
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
            this.canvas.height = 768;
            this.canvas.width = 1024;
            this.camera = { x: 200, y: 100 };
            if (this.levelData == null) {
                this.levelData = [];
                for (var i = 0; i < 160; i++) {
                    var row = [];
                    this.levelData.push(row);
                    for (var j = 0; j < 160; j++) {
                        row.push({ tileID: 0, height: 0 });
                    }
                }
            }
            this.canvas.onmousedown = function (event) {
                var rect = _this.canvas.getBoundingClientRect();
                _this.click(event.clientX - rect.left, event.clientY - rect.top);
            };
            document.body.appendChild(this.canvas);
        }
        Engine.prototype.click = function (x, y) {
            var pos = {
                x: x - this.camera.x,
                y: y - this.camera.y
            };
            var cord = Engine.getTileCoordinates(Engine.isoTo2D(pos), this.tileWidth);
            var nextTileId = this.levelData[cord.x][cord.y].tileID + 1;
            var nextTileCount = this.tiles[nextTileId].length;
            this.levelData[cord.x][cord.y].tileID = nextTileId;
            this.levelData[cord.x][cord.y].height = 1;
        };
        Engine.prototype.addTile = function (tile) {
            this.tiles.push(tile);
        };
        Engine.prototype.start = function () {
            window.requestAnimationFrame(this.render.bind(this));
        };
        Engine.prototype.render = function () {
            this.ctx.fillStyle = "black";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            var drawTile;
            for (var h = 0; h < 10; h++) {
                for (var i = 0; i < this.levelData.length; i++) {
                    for (var j = 0; j < this.levelData[0].length; j++) {
                        drawTile = this.levelData[i][j];
                        //  if (drawTile.tileID == 0) continue;
                        if (drawTile.height == h) {
                            this.drawTile(drawTile.tileID, i, j);
                            this.drawImage(drawTile.tileID, i, j);
                        }
                    }
                }
            }
            window.requestAnimationFrame(this.render.bind(this));
        };
        Engine.prototype.drawTile = function (type, i, j) {
            var pos = new Point(i * this.tileWidth, j * this.tileWidth);
            pos.x += this.camera.x;
            pos.y += this.camera.y;
            var tiles = this.tiles[type];
            var refTile = this.tiles[type][0];
            var _x = refTile.header.PositionX;
            var _y = refTile.header.PositionY;
            for (var _i = 0, tiles_1 = tiles; _i < tiles_1.length; _i++) {
                var tile = tiles_1[_i];
                var isoPos = Engine.twoDToIso(pos);
                isoPos.x += tile.header.PositionX - _x;
                isoPos.y += tile.header.PositionY + tile.header.TilePositionY - _y;
                //isoPos.y += tile.header.TilePositionY;
                canvas_util_1.CanvasUtil.putImageWithTransparency(this.ctx, new ImageData(tile.tile, 30, 16), isoPos.x, isoPos.y);
            }
        };
        Engine.prototype.drawImage = function (type, i, j) {
            var pos = new Point(i * this.tileWidth, j * this.tileWidth);
            pos.x += this.camera.x;
            pos.y += this.camera.y;
            var isoPos = Engine.twoDToIso(pos);
            var tiles = this.tiles[type];
            var refTile = this.tiles[type][0];
            var _x = refTile.header.PositionX;
            var _y = refTile.header.PositionY;
            for (var _i = 0, tiles_2 = tiles; _i < tiles_2.length; _i++) {
                var tile = tiles_2[_i];
                var isoPos_1 = Engine.twoDToIso(pos);
                isoPos_1.x += tile.header.PositionX + tile.header.HorizontalOffset - _x;
                isoPos_1.y += tile.header.PositionY - _y;
                canvas_util_1.CanvasUtil.putImageWithTransparency(this.ctx, new ImageData(tile.image, tile.header.Width, tile.header.Height), isoPos_1.x, isoPos_1.y);
            }
        };
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
        return Engine;
    }());
    strongholdjs.Engine = Engine;
})(strongholdjs = exports.strongholdjs || (exports.strongholdjs = {}));
//# sourceMappingURL=engine.js.map