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
var Gui = /** @class */ (function (_super) {
    __extends(Gui, _super);
    function Gui() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Gui.prototype.init = function (engine) {
        var _this = this;
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
        // this.buildingContainer =
    };
    Gui.prototype.imagedata_to_url = function (imagedata) {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = imagedata.width;
        canvas.height = imagedata.height;
        ctx.putImageData(imagedata, 0, 0);
        return canvas.toDataURL();
    };
    return Gui;
}(gameObject_1.GameObject));
exports.Gui = Gui;
//# sourceMappingURL=gui.js.map