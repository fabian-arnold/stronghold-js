"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/internal/Observable");
var forkJoin_1 = require("rxjs/internal/observable/forkJoin");
var gm1_loader_1 = require("./gm1-loader");
var canvas_util_1 = require("../util/canvas-util");
var tgx_loader_1 = require("./tgx-loader");
var ResourceCollections;
(function (ResourceCollections) {
    ResourceCollections["BUILDINGS_CASTLES"] = "gm/tile_castle.gm1";
    ResourceCollections["TERRAIN_GRASSLANDS"] = "gm/tile_land_macros.gm1";
    ResourceCollections["TERRAIN_DATA"] = "gm/tile_data.gm1";
    ResourceCollections["TERRAIN_STONELANDS"] = "gm/tile_land8.gm1";
    ResourceCollections["BUILDINGS_STOCKPILES"] = "gm/tile_goods.gm1";
    ResourceCollections["SCRIBE"] = "gm/scribe.gm1";
    ResourceCollections["INTERFACE_BUTTONS"] = "gm/interface_buttons.gm1";
    ResourceCollections["INTERFACE_ARMY"] = "gm/interface_army.gm1";
    ResourceCollections["INTERFACE_ICONS2"] = "gm/interface_icons2.gm1";
    ResourceCollections["INTERFACE_ICONS3"] = "gm/interface_icons3.gm1";
    ResourceCollections["INTERFACE_RUINS"] = "gm/interface_ruins.gm1";
    ResourceCollections["INTERFACE_SLIDER_BAR"] = "gm/interface_slider_bar.gm1";
    ResourceCollections["INTERFACE_ICONS_FRONT_END"] = "gm/icons_front_end.gm1";
    ResourceCollections["INTERFACE_ICONS_FRONT_END_BUILDER"] = "gm/icons_front_end_builder.gm1";
    ResourceCollections["INTERFACE_ICONS_FRONT_END_COMBAT"] = "gm/icons_front_end_combat.gm1";
    ResourceCollections["INTERFACE_ICONS_FRONT_END_ECONOMICS"] = "gm/icons_front_end_economics.gm1";
    ResourceCollections["INTERFACE_MAP_EDIT"] = "gm/mapedit_buttons.gm1";
    ResourceCollections["INTERFACE_CURSORS_FLOATS"] = "gm/floats.gm1";
    ResourceCollections["INTERFACE_CRACKS"] = "gm/cracks.gm1";
    ResourceCollections["FONT_STRONGHOLD"] = "gm/font_stronghold.gm1";
    ResourceCollections["INTERFACE_FRONTEND_MAIN"] = "gfx/frontend_main.tgx";
    ResourceCollections["INTERFACE_FRONTEND_MAIN2"] = "gfx/frontend_main2.tgx";
    ResourceCollections["INTERFACE_FRONTEND_BUILDER"] = "gfx/frontend_builder.tgx";
    ResourceCollections["INTERFACE_FRONTEND_COMBAT"] = "gfx/frontend_combat.tgx";
    ResourceCollections["INTERFACE_TSLICE1"] = "gfx/tslice1.tgx";
    ResourceCollections["INTERFACE_TEST"] = "gfx/p1.tgx";
})(ResourceCollections = exports.ResourceCollections || (exports.ResourceCollections = {}));
var ResourceManager = /** @class */ (function () {
    function ResourceManager() {
        this.files = [];
        this.gm1Resources = {};
        this.tgxResources = {};
        this._gm1Loader = new gm1_loader_1.Gm1Loader();
        this._tgxLoader = new tgx_loader_1.TGXLoader();
        for (var res in ResourceCollections) {
            this.files.push(ResourceCollections[res]);
        }
    }
    Object.defineProperty(ResourceManager.prototype, "gm1Loader", {
        get: function () {
            return this._gm1Loader;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ResourceManager.prototype, "tgxLoader", {
        get: function () {
            return this._tgxLoader;
        },
        enumerable: true,
        configurable: true
    });
    ResourceManager.createTGXDebugElement = function (resource) {
        var canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
        canvas.width = resource.width;
        canvas.height = resource.height;
        canvas_util_1.CanvasUtil.putImageWithTransparency(ctx, new ImageData(resource.image, resource.width, resource.height), 0, 0);
        return canvas;
    };
    ResourceManager.createGM1DebugElement = function (resource) {
        // create off-screen canvas element
        var canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
        canvas.width = 1400;
        canvas.height = 3000;
        var lastCanvasX = 0;
        var lastCanvasY = 20;
        var maxHeightInRow = 0;
        var d = 0;
        // Draw tiles in resource
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
            try {
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
            }
            catch (e) {
                console.warn("Error while rendering tile", e);
            }
            lastCanvasX += width + 20;
            maxHeightInRow = Math.max(maxHeightInRow, height);
            if (lastCanvasX > 1000) {
                lastCanvasX = 10;
                lastCanvasY += maxHeightInRow + 20;
                maxHeightInRow = 0;
            }
        }
        lastCanvasX = 0;
        // Draw images in resource
        for (var _f = 0, _g = resource.images; _f < _g.length; _f++) {
            var image = _g[_f];
            canvas_util_1.CanvasUtil.putImageWithTransparency(ctx, new ImageData(image.image, image.header.Width, image.header.Height), lastCanvasX, lastCanvasY);
            lastCanvasX += image.header.Width + 20;
            console.log(image.header);
            console.log("LCX", lastCanvasX);
            maxHeightInRow = Math.max(maxHeightInRow, image.header.Height);
            if (lastCanvasX > 1000) {
                lastCanvasX = 10;
                lastCanvasY += maxHeightInRow + 20;
                maxHeightInRow = 0;
            }
        }
        return canvas;
    };
    ResourceManager.prototype.loadResources = function () {
        var _this = this;
        return new Observable_1.Observable(function (subscriber) {
            forkJoin_1.forkJoin(_this.files.map(function (path) {
                if (path.split('.')[1] == 'gm1') {
                    return _this._gm1Loader.loadImage(path);
                }
                else {
                    return _this._tgxLoader.loadImage(path);
                }
            })).subscribe(function (data) {
                for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                    var res = data_1[_i];
                    if (res['path'].split('.')[1] == "gm1") {
                        _this.gm1Resources[res.path] = res;
                    }
                    else if (res['path'].split('.')[1] == "tgx") {
                        _this.tgxResources[res.path] = res;
                    }
                    else {
                        console.error("Unknown resource type");
                    }
                }
                subscriber.next();
                subscriber.complete();
            });
        });
    };
    ResourceManager.prototype.getGM1Resources = function (resCollection) {
        return this.gm1Resources[resCollection];
    };
    ResourceManager.prototype.getGameTile = function (resCollection, id) {
        return this.gm1Resources[resCollection].gameTiles[id];
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
            if (_this.gm1Resources[resourceSelect.value]) {
                canvasContainer.appendChild(ResourceManager.createGM1DebugElement(_this.gm1Resources[resourceSelect.value]));
            }
            else if (_this.tgxResources[resourceSelect.value]) {
                canvasContainer.appendChild(ResourceManager.createTGXDebugElement(_this.tgxResources[resourceSelect.value]));
            }
            else {
                console.error("Unknown resource");
            }
        }, false);
    };
    return ResourceManager;
}());
exports.ResourceManager = ResourceManager;
//# sourceMappingURL=resource-manager.js.map