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
var base_loader_1 = require("./base-loader");
var gm1_loader_1 = require("./gm1-loader");
var TGXResource = /** @class */ (function () {
    function TGXResource() {
    }
    return TGXResource;
}());
exports.TGXResource = TGXResource;
var TGXLoader = /** @class */ (function (_super) {
    __extends(TGXLoader, _super);
    function TGXLoader() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TGXLoader.prototype.parse = function (arrayBuffer, url) {
        var resource = new TGXResource();
        var headerView = new DataView(arrayBuffer, 0, 8);
        resource.width = headerView.getUint16(0, true);
        resource.height = headerView.getUint16(4, true);
        var imageView = new DataView(arrayBuffer, 8);
        var imgBuffer = new Uint8ClampedArray(resource.width * resource.height * 4);
        gm1_loader_1.Gm1Loader.decodeTGX(imageView, resource.width, imgBuffer);
        resource.image = imgBuffer;
        resource.path = url;
        return resource;
    };
    return TGXLoader;
}(base_loader_1.BaseLoader));
exports.TGXLoader = TGXLoader;
//# sourceMappingURL=tgx-loader.js.map