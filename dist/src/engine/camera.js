"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Camera = /** @class */ (function () {
    function Camera() {
    }
    Object.defineProperty(Camera.prototype, "x", {
        get: function () {
            return this._x;
        },
        set: function (value) {
            this._x = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Camera.prototype, "y", {
        get: function () {
            return this._y;
        },
        set: function (value) {
            this._y = value;
        },
        enumerable: true,
        configurable: true
    });
    Camera.prototype.setPos = function (x, y) {
        this._x = x;
        this._y = y;
    };
    Camera.prototype.getPos = function () {
        return {
            x: this._x,
            y: this._y
        };
    };
    return Camera;
}());
exports.Camera = Camera;
//# sourceMappingURL=camera.js.map