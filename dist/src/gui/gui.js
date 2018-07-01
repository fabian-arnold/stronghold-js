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
var gameObject_1 = require("../engine/gameObject");
var resource_manager_1 = require("../resource/resource-manager");
var building_1 = require("../engine/building");
var Gui = /** @class */ (function (_super) {
    __extends(Gui, _super);
    function Gui() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Gui.prototype.init = function (engine) {
        var _this = this;
        this.engine = engine;
        var width = engine.gameWidth;
        engine.resourceManager.tgxLoader.loadImage("gfx/edge" + width + "l.tgx").subscribe(function (value) {
            _this.leftEdge = document.createElement("img");
            _this.leftEdge.style.position = "absolute";
            _this.leftEdge.style.left = "0";
            _this.leftEdge.style.bottom = "0";
            _this.leftEdge.style.width = value.width + "px";
            _this.leftEdge.style.height = value.height + "px";
            _this.leftEdge.src = _this.imagedata_to_url(new ImageData(value.image, value.width, value.height));
            engine.gameContainer.appendChild(_this.leftEdge);
        });
        engine.resourceManager.tgxLoader.loadImage("gfx/edge" + width + "r.tgx").subscribe(function (value) {
            _this.rightEdge = document.createElement("img");
            _this.rightEdge.style.position = "absolute";
            _this.rightEdge.style.right = "0";
            _this.rightEdge.style.bottom = "0";
            _this.rightEdge.style.width = value.width + "px";
            _this.rightEdge.style.height = value.height + "px";
            _this.rightEdge.src = _this.imagedata_to_url(new ImageData(value.image, value.width, value.height));
            engine.gameContainer.appendChild(_this.rightEdge);
        });
        engine.resourceManager.gm1Loader.loadImage("gm/face800-blank.gm1").subscribe(function (value) {
            _this.menuContainer = document.createElement("div");
            _this.menuContainer.style.position = "absolute";
            _this.menuContainer.style.left = "50%";
            _this.menuContainer.style.bottom = "0";
            _this.menuContainer.style.width = value.images[0].header.Width + "px";
            _this.menuContainer.style.height = value.images[0].header.Height + "px";
            _this.menuContainer.style.marginLeft = "-" + (value.images[0].header.Width / 2) + "px";
            _this.menuContainer.style.background = "url(" + _this.imagedata_to_url(new ImageData(value.images[0].image, value.images[0].header.Width, value.images[0].header.Height)) + ")";
            console.log(_this.imagedata_to_url(new ImageData(value.images[0].image, value.images[0].header.Width, value.images[0].header.Height)));
            engine.gameContainer.appendChild(_this.menuContainer);
            _this.createButton(7, 20, 0, _this.menuContainer);
            _this.createButton(10, 20 + 37, 0, _this.menuContainer);
            _this.createButton(13, 20 + 37 * 2, 0, _this.menuContainer);
            _this.createButton(16, 20 + 37 * 3, 0, _this.menuContainer);
            _this.createButton(19, 20 + 37 * 4, 0, _this.menuContainer);
            _this.createButton(22, 20 + 37 * 5, 0, _this.menuContainer);
            var placeholders = _this.engine.resourceManager.getGM1Resources(resource_manager_1.ResourceCollections.INTERFACE_ICONS_PLACEHOLDERS);
            for (var _i = 0, _a = placeholders.images; _i < _a.length; _i++) {
                var pl = _a[_i];
            }
            _this.createBuildButton(18, 25, 45, _this.menuContainer);
            _this.createBuildButton(14, 60, 45, _this.menuContainer);
            _this.createBuildButton(16, 120, 40, _this.menuContainer);
            _this.createBuildButton(12, 190, 35, _this.menuContainer);
            //this.createButton(engine.resourceManager.getGM1Resources(ResourceCollections.INTERFACE_BUTTONS).images[103], 0, 0, this.menuContainer);
            //this.createButton(engine.resourceManager.getGM1Resources(ResourceCollections.INTERFACE_BUTTONS).images[106], 0, 0, this.menuContainer);
            //this.createButton(engine.resourceManager.getGM1Resources(ResourceCollections.INTERFACE_BUTTONS).images[109], 0, 0, this.menuContainer);
        });
        // this.buildingContainer =
    };
    Gui.prototype.render = function (ctx) {
        var cord = this.engine.input.getMouseChunkPos();
        var castle = this.engine.resourceManager.getGM1Resources(resource_manager_1.ResourceCollections.BUILDINGS_CASTLES).gameTiles[3];
        building_1.Building.drawTile(ctx, castle.tiles, cord.i, cord.j);
        building_1.Building.drawImage(ctx, castle.tiles, cord.i, cord.j);
    };
    Gui.prototype.update = function () {
        if (this.engine.input.isMouseDown()) {
            var cord = this.engine.input.getMouseChunkPos();
            var nextTileId = (this.engine.terrain.getTileId(cord.i, cord.j) + 1) % 3;
            // //     const nextTileCount = this.tiles[nextTileId].length;
            //
            this.engine.terrain.setTileId(cord.i, cord.j, nextTileId);
        }
    };
    Gui.prototype.createBuildButton = function (imageNr, x, y, container) {
        var image = this.engine.resourceManager.getGM1Resources(resource_manager_1.ResourceCollections.INTERFACE_ICONS_PLACEHOLDERS).images[imageNr];
        var hoverImage = this.engine.resourceManager.getGM1Resources(resource_manager_1.ResourceCollections.INTERFACE_ICONS_PLACEHOLDERS).images[imageNr + 1];
        var imageSrc = this.imagedata_to_url(new ImageData(image.image, image.header.Width, image.header.Height));
        var hoverImageSrc = this.imagedata_to_url(new ImageData(hoverImage.image, hoverImage.header.Width, hoverImage.header.Height));
        var button = document.createElement("img");
        button.style.position = "absolute";
        button.style.left = x + "px";
        button.style.bottom = y + "px";
        button.height = image.header.Height;
        button.width = image.header.Width;
        button.src = imageSrc;
        button.onmouseenter = function () {
            button.src = hoverImageSrc;
        };
        button.onmouseleave = function () {
            button.src = imageSrc;
        };
        this.menuContainer.appendChild(button);
    };
    Gui.prototype.createButton = function (imageNr, x, y, container) {
        var image = this.engine.resourceManager.getGM1Resources(resource_manager_1.ResourceCollections.INTERFACE_BUTTONS).images[imageNr];
        var hoverImage = this.engine.resourceManager.getGM1Resources(resource_manager_1.ResourceCollections.INTERFACE_BUTTONS).images[imageNr + 1];
        var clickImage = this.engine.resourceManager.getGM1Resources(resource_manager_1.ResourceCollections.INTERFACE_BUTTONS).images[imageNr + 2];
        var imageSrc = this.imagedata_to_url(new ImageData(image.image, image.header.Width, image.header.Height));
        var hoverImageSrc = this.imagedata_to_url(new ImageData(hoverImage.image, hoverImage.header.Width, hoverImage.header.Height));
        var clickImageSrc = this.imagedata_to_url(new ImageData(clickImage.image, clickImage.header.Width, clickImage.header.Height));
        var button = document.createElement("img");
        console.log(image.header);
        button.style.position = "absolute";
        button.style.left = x + "px";
        button.style.bottom = y + "px";
        button.height = image.header.Height;
        button.width = image.header.Width;
        button.src = imageSrc;
        button.onmouseenter = function () {
            button.src = hoverImageSrc;
        };
        button.onmouseleave = function () {
            button.src = imageSrc;
        };
        button.onmousedown = function () {
            button.src = clickImageSrc;
        };
        button.onmouseup = function () {
            button.src = hoverImageSrc;
        };
        container.appendChild(button);
    };
    Gui.prototype.imagedata_to_url = function (imagedata) {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = imagedata.width;
        canvas.height = imagedata.height;
        ctx.putImageData(imagedata, 0, 0);
        return canvas.toDataURL();
    };
    Gui.prototype.image_to_background = function (imagedata, ele) {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = imagedata.width;
        canvas.height = imagedata.height;
        ctx.putImageData(imagedata, 0, 0);
        canvas.toBlob(function (blob) {
            ele.style.backgroundImage = URL.createObjectURL(blob);
        });
    };
    return Gui;
}(gameObject_1.GameObject));
exports.Gui = Gui;
//# sourceMappingURL=gui.js.map