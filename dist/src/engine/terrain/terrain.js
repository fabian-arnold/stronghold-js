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
    function Chunk(levelData, tiles, startI, startJ, countI, countJ) {
        this.levelData = levelData;
        this.tiles = tiles;
        this.startI = startI;
        this.startJ = startJ;
        this.countI = countI;
        this.countJ = countJ;
        this.dirty = true;
        this.cacheCanvas = document.createElement("canvas");
        this.cacheCanvas.width = countI * 2 * Terrain.tileSize + 2 * Terrain.tileSize;
        this.cacheCanvas.height = countJ * Terrain.tileSize + Terrain.tileSize;
        this.cacheCtx = this.cacheCanvas.getContext("2d");
    }
    Chunk.pointToCoord = function (point) {
        return {
            x: ((point.y % 2) * Terrain.tileSize) + (point.x * 2 * Terrain.tileSize),
            y: point.y * Terrain.tileSize
        };
    };
    Chunk.prototype.render = function (ctx) {
        if (this.dirty) {
            this.updateChunk();
        }
        ctx.drawImage(this.cacheCanvas, this.startI * 2 * Terrain.tileSize, this.startJ * Terrain.tileSize);
    };
    Chunk.prototype.markDirty = function () {
        this.dirty = true;
    };
    Chunk.prototype.updateChunk = function () {
        for (var i = 0; i < this.countI; i++) {
            for (var j = 0; j < this.countJ; j++) {
                var tileId = this.levelData[this.startI + i][this.startJ + j].tileID;
                this.drawTile(tileId, i, j);
            }
        }
        for (var i = 0; i < this.countI; i++) {
            for (var j = 0; j < this.countJ; j++) {
                var tileId = this.levelData[this.startI + i][this.startJ + j].tileID;
                this.drawImage(tileId, i, j);
            }
        }
        this.dirty = false;
        this.cacheCtx.strokeStyle = "red";
        this.cacheCtx.rect(0, 0, this.cacheCanvas.width, this.cacheCanvas.height);
        this.cacheCtx.stroke();
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
    return Chunk;
}());
var Terrain = /** @class */ (function () {
    function Terrain(ctx, camera, tiles, width, height) {
        this.ctx = ctx;
        this.camera = camera;
        this.tiles = tiles;
        this.width = width;
        this.height = height;
        this.chunkTileSize = 20;
        this.levelData = null;
        this.chunks = [];
        if (width % this.chunkTileSize != 0 || height % this.chunkTileSize != 0) {
            throw new Error("Invalid chunk size.\n width / height % this.chunkTileSize must be 0");
        }
        this.chunkCountI = (this.width / this.chunkTileSize);
        this.chunkCountJ = (this.height / this.chunkTileSize);
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
        for (var i = 0; i < this.chunkCountI; i++) {
            this.chunks[i] = [];
            for (var j = 0; j < this.chunkCountJ; j++) {
                this.chunks[i][j] = new Chunk(this.levelData, this.tiles, i * this.chunkTileSize, j * this.chunkTileSize, this.chunkTileSize, this.chunkTileSize);
            }
        }
    }
    Terrain.prototype.setTileId = function (i, j, tileId) {
        this.levelData[i][j].tileID = tileId;
        this.chunks[Math.floor(i / this.chunkTileSize)][Math.floor(j / this.chunkTileSize)].markDirty();
    };
    Terrain.prototype.getTileId = function (i, j) {
        return this.levelData[i][j].tileID;
    };
    Terrain.prototype.render = function () {
        // Half tile size offset value
        var startI = Math.max(Math.floor((this.camera.x - Terrain.tileSize) / (this.chunkTileSize * Terrain.tileSize * 2)), 0);
        var startJ = Math.max(Math.floor((this.camera.y - Terrain.tileSize / 2) / (this.chunkTileSize * Terrain.tileSize)), 0);
        var endI = Math.min(Math.ceil((this.camera.x + this.ctx.canvas.width) / (this.chunkTileSize * Terrain.tileSize * 2)), this.chunkCountI);
        var endJ = Math.min(Math.ceil((this.camera.y + this.ctx.canvas.height) / (this.chunkTileSize * Terrain.tileSize)), this.chunkCountJ);
        for (var x = startI; x < endI; x++) {
            for (var y = startJ; y < endJ; y++) {
                this.chunks[x][y].render(this.ctx);
            }
        }
    };
    Terrain.tileSize = 12;
    return Terrain;
}());
exports.Terrain = Terrain;
//# sourceMappingURL=terrain.js.map