"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GameObject = /** @class */ (function () {
    function GameObject() {
    }
    // Render Lifecycles
    GameObject.prototype.preRender = function () {
    };
    GameObject.prototype.render = function (ctx) {
    };
    GameObject.prototype.postRender = function () {
    };
    // Update Lifecycles
    GameObject.prototype.preUpdate = function () {
    };
    GameObject.prototype.update = function () {
    };
    GameObject.prototype.postUpdate = function () {
    };
    // Init Lifecycles
    GameObject.prototype.preInit = function () {
    };
    GameObject.prototype.init = function (engine) {
    };
    GameObject.prototype.postInit = function () {
    };
    return GameObject;
}());
exports.GameObject = GameObject;
//# sourceMappingURL=gameObject.js.map