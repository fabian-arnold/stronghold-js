"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var canvas_util_1 = require("../../util/canvas-util");
var engine_1 = require("../engine");
var LevelTile = /** @class */ (function () {
    function LevelTile() {
    }
    return LevelTile;
}());
var Chunk = /** @class */ (function () {
    function Chunk(levelData, tiles, startX, startY, width, height) {
        this.levelData = levelData;
        this.tiles = tiles;
        this.startX = startX;
        this.startY = startY;
        this.width = width;
        this.height = height;
        this.dirty = true;
        this.cacheCanvas = document.createElement("canvas");
        this.cacheCanvas.width = width * 2 * Chunk.tileSize + 2 * Chunk.tileSize;
        this.cacheCanvas.height = height * 2 * Chunk.tileSize + 2 * Chunk.tileSize;
        this.cacheCtx = this.cacheCanvas.getContext("2d");
    }
    Chunk.pointToCoord = function (point) {
        return {
            x: ((point.y % 2) * Chunk.tileSize) + (point.x * 2 * Chunk.tileSize),
            y: point.y * Chunk.tileSize
        };
    };
    Chunk.prototype.render = function (ctx) {
        if (this.dirty) {
            this.updateChunk();
        }
        ctx.drawImage(this.cacheCanvas, this.startX * 2 * Chunk.tileSize, this.startY * Chunk.tileSize);
    };
    Chunk.prototype.markDirty = function () {
        this.dirty = true;
    };
    Chunk.prototype.updateChunk = function () {
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                var tileId = this.levelData[this.startX + x][this.startY + y].tileID;
                this.drawTile(tileId, x, y);
            }
        }
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                var tileId = this.levelData[this.startX + x][this.startY + y].tileID;
                this.drawImage(tileId, x, y);
            }
        }
        this.dirty = false;
    };
    Chunk.prototype.drawTile = function (type, i, j) {
        var tiles = this.tiles[type];
        var refTile = this.tiles[type][0];
        var _x = refTile.header.PositionX;
        var _y = refTile.header.PositionY;
        for (var _i = 0, tiles_1 = tiles; _i < tiles_1.length; _i++) {
            var tile = tiles_1[_i];
            var isoPos = Chunk.pointToCoord(new engine_1.Point(i, j));
            isoPos.x += tile.header.PositionX - _x;
            isoPos.y += tile.header.PositionY + tile.header.TilePositionY - _y;
            //isoPos.y += tile.header.TilePositionY;
            canvas_util_1.CanvasUtil.putImageWithTransparency(this.cacheCtx, new ImageData(tile.tile, 30, 16), isoPos.x, isoPos.y);
        }
    };
    Chunk.prototype.drawImage = function (type, i, j) {
        var tiles = this.tiles[type];
        var refTile = this.tiles[type][0];
        var _x = refTile.header.PositionX;
        var _y = refTile.header.PositionY;
        for (var _i = 0, tiles_2 = tiles; _i < tiles_2.length; _i++) {
            var tile = tiles_2[_i];
            var isoPos = Chunk.pointToCoord(new engine_1.Point(i, j));
            isoPos.x += tile.header.PositionX + tile.header.HorizontalOffset - _x;
            isoPos.y += tile.header.PositionY - _y;
            canvas_util_1.CanvasUtil.putImageWithTransparency(this.cacheCtx, new ImageData(tile.image, tile.header.Width, tile.header.Height), isoPos.x, isoPos.y);
        }
    };
    Chunk.tileSize = 12;
    return Chunk;
}());
var Terrain = /** @class */ (function () {
    function Terrain(ctx, camera, tiles, width, height) {
        this.ctx = ctx;
        this.camera = camera;
        this.tiles = tiles;
        this.width = width;
        this.height = height;
        this.chunkSize = 5;
        this.chunkTileSize = 20;
        this.levelData = null;
        this.chunks = [];
        if (width % this.chunkTileSize != 0 || height % this.chunkTileSize != 0) {
            throw new Error("Invalid chunk size.\n width / height % this.chunkTileSize must be 0");
        }
        this.chunkCountX = (this.width / this.chunkTileSize);
        this.chunkCountY = (this.height / this.chunkTileSize);
        // Initialize Level Data
        if (this.levelData == null) {
            this.levelData = [];
            for (var i = 0; i < this.width; i++) {
                var row = [];
                this.levelData.push(row);
                for (var j = 0; j < this.height; j++) {
                    row.push({ tileID: 0, height: 0, dirty: true });
                }
            }
        }
        // Create Chunks
        for (var x = 0; x < this.chunkCountX; x++) {
            this.chunks[x] = [];
            for (var y = 0; y < this.chunkCountY; y++) {
                this.chunks[x][y] = new Chunk(this.levelData, this.tiles, x * 20, y * 20, 20, 20);
            }
        }
    }
    Terrain.prototype.render = function () {
        // Half tile size offset value
        var startX = Math.max(Math.floor((this.camera.x - Chunk.tileSize) / (this.chunkTileSize * Chunk.tileSize * 2)), 0);
        var startY = Math.max(Math.floor((this.camera.y - Chunk.tileSize / 2) / (this.chunkTileSize * Chunk.tileSize)), 0);
        var endX = Math.min(Math.ceil((this.camera.x + this.ctx.canvas.width) / (this.chunkTileSize * Chunk.tileSize * 2)), this.chunkCountX);
        var endY = Math.min(Math.ceil((this.camera.y + this.ctx.canvas.height) / (this.chunkTileSize * Chunk.tileSize)), this.chunkCountY);
        console.log("Start", startY);
        console.log("End", endY);
        for (var x = startX; x < endX; x++) {
            for (var y = startY; y < endY; y++) {
                this.chunks[x][y].render(this.ctx);
            }
        }
    };
    return Terrain;
}());
exports.Terrain = Terrain;
//# sourceMappingURL=terrain.js.map