"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("rxjs/index");
var BaseLoader = /** @class */ (function () {
    function BaseLoader() {
    }
    BaseLoader.prototype.loadImage = function (url) {
        var _this = this;
        var oReq = new XMLHttpRequest();
        oReq.open("GET", url, true);
        // oReq.open("GET", "gm/tile_goods.gm1", true);
        oReq.responseType = "arraybuffer";
        console.log("Loading image...");
        return new index_1.Observable(function (subscriber) {
            oReq.onload = function (oEvent) {
                subscriber.next(_this.parse(oReq.response, url));
                subscriber.complete();
            };
            oReq.send(null);
        });
    };
    BaseLoader.prototype.parse = function (arrayBuffer, url) {
        throw Error("not implemented parser");
    };
    return BaseLoader;
}());
exports.BaseLoader = BaseLoader;
//# sourceMappingURL=base-loader.js.map