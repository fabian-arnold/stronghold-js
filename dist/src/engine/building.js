"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var canvas_util_1 = require("../util/canvas-util");
var engine_1 = require("./engine");
var terrain_1 = require("./terrain/terrain");
var Building = /** @class */ (function () {
    function Building() {
    }
    // FIXME unify with the canvas draw version
    Building.drawTile = function (ctx, tiles, i, j) {
        var refTile = tiles[0];
        var _x = refTile.header.PositionX;
        var _y = refTile.header.PositionY;
        for (var _i = 0, tiles_1 = tiles; _i < tiles_1.length; _i++) {
            var tile = tiles_1[_i];
            var isoPos = terrain_1.Terrain.pointToCoord(new engine_1.ChunkPos(i, j));
            isoPos.x += tile.header.PositionX - _x;
            isoPos.y += tile.header.PositionY + tile.header.TilePositionY - _y;
            //isoPos.y += tile.header.TilePositionY;
            canvas_util_1.CanvasUtil.putImageWithTransparency(ctx, new ImageData(tile.tile, 30, 16), isoPos.x, isoPos.y);
        }
    };
    Building.drawImage = function (ctx, tiles, i, j) {
        var refTile = tiles[0];
        var _x = refTile.header.PositionX;
        var _y = refTile.header.PositionY;
        for (var _i = 0, tiles_2 = tiles; _i < tiles_2.length; _i++) {
            var tile = tiles_2[_i];
            var isoPos = terrain_1.Terrain.pointToCoord(new engine_1.ChunkPos(i, j));
            isoPos.x += tile.header.PositionX + tile.header.HorizontalOffset - _x;
            isoPos.y += tile.header.PositionY - _y;
            canvas_util_1.CanvasUtil.putImageWithTransparency(ctx, new ImageData(tile.image, tile.header.Width, tile.header.Height), isoPos.x, isoPos.y);
        }
    };
    return Building;
}());
exports.Building = Building;
//# sourceMappingURL=building.js.map