"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CanvasUtil = /** @class */ (function () {
    function CanvasUtil() {
    }
    CanvasUtil.putImageWithTransparency = function (ctx, srcImage, x, y) {
        var destImg = ctx.getImageData(x, y, srcImage.width, srcImage.height);
        for (var i = 0; i < destImg.data.length; i += 4) {
            if (srcImage.data[i + 3] == 0)
                continue;
            destImg.data[i] = srcImage.data[i];
            destImg.data[i + 1] = srcImage.data[i + 1];
            destImg.data[i + 2] = srcImage.data[i + 2];
            destImg.data[i + 3] = srcImage.data[i + 3];
        }
        ctx.putImageData(destImg, x, y);
    };
    return CanvasUtil;
}());
exports.CanvasUtil = CanvasUtil;
//# sourceMappingURL=canvas-util.js.map