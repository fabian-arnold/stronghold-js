"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/internal/Observable");
var forkJoin_1 = require("rxjs/internal/observable/forkJoin");
var image_loader_1 = require("./image-loader");
var canvas_util_1 = require("../util/canvas-util");
var ResourceCollections;
(function (ResourceCollections) {
    ResourceCollections["CASTLES"] = "gm/tile_castle.gm1";
    ResourceCollections["GRASSLANDS"] = "gm/tile_land_macros.gm1";
    ResourceCollections["STONELANDS"] = "gm/tile_land8.gm1";
    ResourceCollections["STOCKPILES"] = "gm/tile_goods.gm1";
})(ResourceCollections = exports.ResourceCollections || (exports.ResourceCollections = {}));
var ResourceManager = /** @class */ (function () {
    function ResourceManager() {
        this.files = [ResourceCollections.CASTLES,
            ResourceCollections.GRASSLANDS,
            ResourceCollections.STONELANDS,
            ResourceCollections.STOCKPILES];
        this.resources = {};
        this.imageLoader = new image_loader_1.ImageLoader();
    }
    ResourceManager.prototype.loadResources = function () {
        var _this = this;
        return new Observable_1.Observable(function (subscriber) {
            forkJoin_1.forkJoin(_this.files.map(function (path) { return _this.imageLoader.loadImage(path); })).subscribe(function (data) {
                for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                    var res = data_1[_i];
                    _this.resources[res.path] = res;
                }
                subscriber.next();
                subscriber.complete();
            });
        });
    };
    ResourceManager.prototype.getResources = function (resCollection) {
        return this.resources[resCollection];
    };
    ResourceManager.prototype.getGameTile = function (resCollection, id) {
        return this.resources[resCollection].gameTiles[id];
    };
    ResourceManager.prototype.addDebugGUI = function () {
        var _this = this;
        var debugContainer = document.createElement("div");
        var canvasContainer = document.createElement("div");
        // Create DropDown with the different resource collections
        var resourceSelect = document.createElement("select");
        for (var _i = 0, _a = this.files; _i < _a.length; _i++) {
            var file = _a[_i];
            var option = document.createElement("option");
            option.value = file;
            option.text = file;
            resourceSelect.add(option);
        }
        debugContainer.appendChild(resourceSelect);
        debugContainer.appendChild(canvasContainer);
        document.body.appendChild(debugContainer);
        // Add listener for DropDown
        resourceSelect.addEventListener("change", function (event) {
            // remove old canvas
            while (canvasContainer.firstChild) {
                canvasContainer.removeChild(canvasContainer.firstChild);
            }
            canvasContainer.appendChild(_this.createDebugTileCanvas(_this.resources[resourceSelect.value]));
        }, false);
    };
    ResourceManager.prototype.createDebugTileCanvas = function (resource) {
        // create off-screen canvas element
        var canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
        canvas.width = 1400;
        canvas.height = 3000;
        var lastCanvasX = 0;
        var lastCanvasY = 20;
        var maxCanvasHeight = 0;
        var d = 0;
        for (var _i = 0, _a = resource.gameTiles; _i < _a.length; _i++) {
            var gameTiles = _a[_i];
            //bounding box
            var top_1 = Infinity;
            var left = Infinity;
            var bottom = 0;
            var right = 0;
            for (var _b = 0, _c = gameTiles.tiles; _b < _c.length; _b++) {
                var tile = _c[_b];
                //find bounds of the sub-images
                var x = tile.header.PositionX;
                var y = tile.header.PositionY;
                var w = tile.header.Width;
                var h = tile.header.Height;
                left = Math.min(left, x);
                top_1 = Math.min(top_1, y);
                right = Math.max(right, x + w);
                bottom = Math.max(bottom, y + h);
            }
            //calculate the actual dimensions of the image
            var width = right - left;
            var height = bottom - top_1;
            ctx.rect(lastCanvasX - 5, lastCanvasY - 5, width + 5, height + 5);
            ctx.stroke();
            ctx.fillText(d++ + "", lastCanvasX, lastCanvasY - 7);
            for (var _d = 0, _e = gameTiles.tiles; _d < _e.length; _d++) {
                var tile = _e[_d];
                // draw the tile part
                var x = tile.header.PositionX - left;
                var y = tile.header.PositionY + tile.header.TilePositionY - top_1;
                canvas_util_1.CanvasUtil.putImageWithTransparency(ctx, new ImageData(tile.tile, 30, 16), x + lastCanvasX, y + lastCanvasY);
                //draw the image part
                x = tile.header.PositionX + tile.header.HorizontalOffset - left;
                y = tile.header.PositionY - top_1;
                canvas_util_1.CanvasUtil.putImageWithTransparency(ctx, new ImageData(tile.image, tile.header.Width, tile.header.Height), x + lastCanvasX, y + lastCanvasY);
            }
            lastCanvasX += width + 20;
            maxCanvasHeight = Math.max(maxCanvasHeight, height);
            if (lastCanvasX > 1000) {
                lastCanvasX = 10;
                lastCanvasY += maxCanvasHeight + 20;
                maxCanvasHeight = 0;
            }
        }
        return canvas;
    };
    return ResourceManager;
}());
exports.ResourceManager = ResourceManager;
//# sourceMappingURL=resource-manager.js.map