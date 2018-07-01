"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var canvas_util_1 = require("../../util/canvas-util");
var engine_1 = require("../engine");
var gameObject_1 = require("../gameObject");
var SimplexNoise = require("simplex-noise");
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
    Chunk.prototype.render = function (ctx) {
        if (this.dirty) {
            this.updateChunk();
        }
        ctx.drawImage(this.cacheCanvas, this.startI * 2 * Terrain.tileSize, this.startJ * Terrain.tileSize);
    };
    Chunk.prototype.markDirty = function () {
        this.dirty = true;
    };
    Chunk.prototype.preRender = function () {
        if (this.dirty) {
            this.updateChunk();
        }
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
            var isoPos = Terrain.pointToCoord(new engine_1.ChunkPos(i, j));
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
            var isoPos = Terrain.pointToCoord(new engine_1.ChunkPos(i, j));
            isoPos.x += tile.header.PositionX + tile.header.HorizontalOffset - _x;
            isoPos.y += tile.header.PositionY - _y;
            canvas_util_1.CanvasUtil.putImageWithTransparency(this.cacheCtx, new ImageData(tile.image, tile.header.Width, tile.header.Height), isoPos.x, isoPos.y);
        }
    };
    return Chunk;
}());
var Terrain = /** @class */ (function (_super) {
    __extends(Terrain, _super);
    function Terrain(ctx, camera, tiles, width, height) {
        var _this = _super.call(this) || this;
        _this.ctx = ctx;
        _this.camera = camera;
        _this.tiles = tiles;
        _this.width = width;
        _this.height = height;
        _this.chunkTileSize = 50;
        _this.levelData = null;
        _this.chunks = [];
        _this.gen = new SimplexNoise();
        if (width % _this.chunkTileSize != 0 || height % (_this.chunkTileSize * 2) != 0) {
            throw new Error("Invalid chunk size.\n width / height % this.chunkTileSize must be 0");
        }
        _this.chunkCountI = (_this.width / _this.chunkTileSize);
        _this.chunkCountJ = (_this.height / (_this.chunkTileSize * 2));
        // Initialize Level Data
        if (_this.levelData == null) {
            _this.levelData = [];
            for (var i = 0; i < _this.width; i++) {
                var row = [];
                _this.levelData.push(row);
                for (var j = 0; j < _this.height; j++) {
                    var nx = i / width - 0.5, ny = j / height - 0.5;
                    var tileId = Math.min(2, Math.max(0, Math.floor((_this.noise(nx, ny) * 3))));
                    //console.log(tileId);
                    row.push({ tileID: tileId, height: 0, dirty: true });
                }
            }
        }
        // Create Chunks
        for (var i = 0; i < _this.chunkCountI; i++) {
            _this.chunks[i] = [];
            for (var j = 0; j < _this.chunkCountJ; j++) {
                _this.chunks[i][j] = new Chunk(_this.levelData, _this.tiles, i * _this.chunkTileSize, j * _this.chunkTileSize * 2, _this.chunkTileSize, _this.chunkTileSize * 2);
                //this.chunks[i][j].preRender();
            }
        }
        return _this;
    }
    Terrain.pointToCoord = function (point) {
        return {
            x: ((point.j % 2) * Terrain.tileSize) + (point.i * 2 * Terrain.tileSize),
            y: point.j * Terrain.tileSize
        };
    };
    Terrain.prototype.setTileId = function (i, j, tileId) {
        this.levelData[i][j].tileID = tileId;
        this.chunks[Math.floor(i / this.chunkTileSize)][Math.floor(j / (this.chunkTileSize * 2))].markDirty();
    };
    Terrain.prototype.getTileId = function (i, j) {
        return this.levelData[i][j].tileID;
    };
    Terrain.prototype.init = function () {
        for (var i = 0; i < this.chunkCountI; i++) {
            for (var j = 0; j < this.chunkCountJ; j++) {
                //FIXME removed due to loading performance
                //       this.chunks[i][j].preRender();
            }
        }
    };
    Terrain.prototype.render = function () {
        // Half tile size offset value
        var startI = Math.max(Math.floor((this.camera.x - Terrain.tileSize) / (this.chunkTileSize * Terrain.tileSize * 2)), 0);
        var startJ = Math.max(Math.floor((this.camera.y - Terrain.tileSize / 2) / (this.chunkTileSize * 2 * Terrain.tileSize)), 0);
        var endI = Math.min(Math.ceil((this.camera.x + this.ctx.canvas.width) / (this.chunkTileSize * Terrain.tileSize * 2)), this.chunkCountI);
        var endJ = Math.min(Math.ceil((this.camera.y + this.ctx.canvas.height) / (this.chunkTileSize * 2 * Terrain.tileSize)), this.chunkCountJ);
        for (var x = startI; x < endI; x++) {
            for (var y = startJ; y < endJ; y++) {
                this.chunks[x][y].render(this.ctx);
            }
        }
    };
    Terrain.prototype.noise = function (nx, ny) {
        // Rescale from -1.0:+1.0 to 0.0:1.0
        return this.gen.noise2D(nx * 4, ny * 4) / 2 + 0.5;
    };
    Terrain.tileSize = 12;
    return Terrain;
}(gameObject_1.GameObject));
exports.Terrain = Terrain;
//# sourceMappingURL=terrain.js.map