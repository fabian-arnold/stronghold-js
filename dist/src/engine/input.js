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
var gameObject_1 = require("./gameObject");
var InputState;
(function (InputState) {
    InputState[InputState["PRESSED"] = 0] = "PRESSED";
    InputState[InputState["RELEASED"] = 1] = "RELEASED";
})(InputState = exports.InputState || (exports.InputState = {}));
var InputSequence;
(function (InputSequence) {
    InputSequence[InputSequence["LEFT"] = 0] = "LEFT";
    InputSequence[InputSequence["RIGHT"] = 1] = "RIGHT";
    InputSequence[InputSequence["UP"] = 2] = "UP";
    InputSequence[InputSequence["DOWN"] = 3] = "DOWN";
})(InputSequence = exports.InputSequence || (exports.InputSequence = {}));
var KeySequence = /** @class */ (function () {
    function KeySequence(keyCode, isAlt, isCtrl) {
        if (isAlt === void 0) { isAlt = false; }
        if (isCtrl === void 0) { isCtrl = false; }
        this.keyCode = keyCode;
        this.isAlt = isAlt;
        this.isCtrl = isCtrl;
    }
    return KeySequence;
}());
exports.KeySequence = KeySequence;
var InputStateInternal;
(function (InputStateInternal) {
    InputStateInternal[InputStateInternal["DOWN"] = 0] = "DOWN";
    InputStateInternal[InputStateInternal["TO_RELEASE"] = 1] = "TO_RELEASE";
    InputStateInternal[InputStateInternal["RELEASED"] = 2] = "RELEASED";
})(InputStateInternal || (InputStateInternal = {}));
var Input = /** @class */ (function (_super) {
    __extends(Input, _super);
    function Input() {
        var _this = _super.call(this) || this;
        _this.keyStates = [];
        _this.keyMapping = [];
        _this.keyMapping[InputSequence.LEFT] = new KeySequence("a".charCodeAt(0));
        _this.keyMapping[InputSequence.UP] = new KeySequence("w".charCodeAt(0));
        _this.keyMapping[InputSequence.RIGHT] = new KeySequence("d".charCodeAt(0));
        _this.keyMapping[InputSequence.DOWN] = new KeySequence("s".charCodeAt(0));
        return _this;
    }
    Input.prototype.register = function () {
        var _this = this;
        window.addEventListener("keydown", function (event) {
            if (!event.repeat) {
                console.log("Down", event);
                _this.keyStates[event.key.charCodeAt(0)] = InputStateInternal.DOWN;
            }
        }, true);
        window.addEventListener("keyup", function (event) {
            console.log("Up", event);
            _this.keyStates[event.key.charCodeAt(0)] = InputStateInternal.TO_RELEASE;
        }, true);
    };
    Input.prototype.isDown = function (key) {
        var seq = this.keyMapping[key];
        return this.keyStates[seq.keyCode] == InputStateInternal.DOWN || this.keyStates[seq.keyCode] == InputStateInternal.TO_RELEASE;
    };
    Input.prototype.isUp = function (key) {
        return !this.isDown(key);
    };
    Input.prototype.update = function () {
        // Delay releasing the keys so there are down at least one cycle
        for (var key in this.keyStates) {
            if (this.keyStates[key] == InputStateInternal.TO_RELEASE) {
                this.keyStates[key] = InputStateInternal.RELEASED;
            }
        }
    };
    return Input;
}(gameObject_1.GameObject));
exports.Input = Input;
//# sourceMappingURL=input.js.map