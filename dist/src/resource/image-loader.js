"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
// program.js
var Image = /** @class */ (function () {
    function Image() {
    }
    return Image;
}());
exports.Image = Image;
var GM1Header = /** @class */ (function () {
    function GM1Header() {
    }
    return GM1Header;
}());
var GM1ImageHeader = /** @class */ (function () {
    function GM1ImageHeader() {
    }
    return GM1ImageHeader;
}());
var GM1EntryInfo = /** @class */ (function () {
    function GM1EntryInfo() {
    }
    return GM1EntryInfo;
}());
var GM1Tile = /** @class */ (function () {
    function GM1Tile() {
    }
    return GM1Tile;
}());
exports.GM1Tile = GM1Tile;
var GM1Image = /** @class */ (function () {
    function GM1Image() {
    }
    return GM1Image;
}());
exports.GM1Image = GM1Image;
var GameTile = /** @class */ (function () {
    function GameTile() {
    }
    return GameTile;
}());
exports.GameTile = GameTile;
var GM1Resource = /** @class */ (function () {
    function GM1Resource() {
    }
    return GM1Resource;
}());
exports.GM1Resource = GM1Resource;
var ImageLoader = /** @class */ (function () {
    function ImageLoader() {
        console.log("Created image loader");
    }
    ImageLoader.prototype.decodeTile = function (tileData, data) {
        var readPos = 0;
        for (var c_y = 0; c_y < ImageLoader.GM1TilePixelsPerLine.length; c_y++) {
            for (var c_x = 0; c_x < ImageLoader.GM1TilePixelsPerLine[c_y]; c_x++) {
                var y = c_y;
                var x = 15 - ImageLoader.GM1TilePixelsPerLine[y] / 2 + c_x;
                // console.log("Decode GM1Tile: " + x + " " + y);
                var pos = (y * 30 + x) * 4;
                var color = tileData.getUint16(readPos, true);
                this.writeColor(data, pos, color);
                readPos += 2;
            }
        }
    };
    ImageLoader.prototype.writeColor = function (data, pos, color) {
        var blue = color & 31;
        var red = (color >> 10) & 31;
        var green = (color >> 5) & 31;
        data[pos + 0] = red * 8;
        data[pos + 1] = green * 8;
        data[pos + 2] = blue * 8;
        data[pos + 3] = 255;
    };
    ImageLoader.prototype.decodeTGX = function (imageData, header, data) {
        var x = 0;
        var y = 0;
        var readPos = 0;
        while (true) {
            if (readPos + 1 > imageData.byteLength) {
                break;
            }
            var tokenType = (imageData.getUint8(readPos) >> 5) & 7;
            var tokenLength = imageData.getUint8(readPos) & 31;
            readPos += 1;
            if (tokenType == 4) {
                // Newline
                y++;
                x = 0;
                //x -= tokenLength;
                continue;
            }
            if (tokenType == 1) {
                // Transparent-Pixel-String
                x += tokenLength + 1;
                continue;
            }
            if (tokenType == 0) {
                // Stream-of-pixels
                for (var i = 0; i < tokenLength + 1; i++) {
                    var pos = ((y) * header.Width + (x)) * 4;
                    var color = imageData.getUint16(readPos, true);
                    this.writeColor(data, pos, color);
                    x++;
                    readPos += 2;
                }
                continue;
            }
            if (tokenType == 2) {
                // repeating pixel
                var color = imageData.getUint16(readPos, true);
                readPos += 2;
                for (var i = 0; i < tokenLength + 1; i++) {
                    var pos = ((y) * header.Width + (x)) * 4;
                    this.writeColor(data, pos, color);
                    x++;
                }
                continue;
            }
            console.error("Invalid token type");
            break;
        }
    };
    ImageLoader.prototype.parseGM1Header = function (header, dataView) {
        header.ImageCount = dataView.getInt32(12, true);
        header.DataType = dataView.getInt32(20, true);
    };
    ImageLoader.prototype.loadImage = function (url) {
        var _this = this;
        var oReq = new XMLHttpRequest();
        oReq.open("GET", url, true);
        // oReq.open("GET", "gm/tile_goods.gm1", true);
        oReq.responseType = "arraybuffer";
        console.log("Loading image...");
        return new rxjs_1.Observable(function (subscriber) {
            oReq.onload = function (oEvent) {
                var arrayBuffer = oReq.response; // Note: not oReq.responseText
                if (arrayBuffer) {
                    var header = new GM1Header();
                    var headerDataView = new DataView(arrayBuffer, 0, 88);
                    _this.parseGM1Header(header, headerDataView);
                    var paletteDataView = new DataView(arrayBuffer, 88, 5120);
                    console.log("Header data", headerDataView);
                    var imageOffsets = new Uint32Array(arrayBuffer, 5120 + 88, 4 * header.ImageCount);
                    var imageSizes = new Uint32Array(arrayBuffer, 5120 + 88 + 4 * header.ImageCount, 4 * header.ImageCount);
                    var imageHeadersBuffer = new DataView(arrayBuffer, 88 + 5120 + 8 * header.ImageCount);
                    var imageHeaders = [];
                    // Read image
                    var readPos = 0;
                    for (var imageNumber = 0; imageNumber < header.ImageCount; imageNumber++) {
                        var imageHeader = new GM1ImageHeader();
                        imageHeader.Width = imageHeadersBuffer.getUint16(readPos, true);
                        imageHeader.Height = imageHeadersBuffer.getUint16(readPos + 2, true);
                        imageHeader.PositionX = imageHeadersBuffer.getUint16(readPos + 4, true);
                        imageHeader.PositionY = imageHeadersBuffer.getUint16(readPos + 6, true);
                        imageHeader.Part = imageHeadersBuffer.getUint8(readPos + 8);
                        imageHeader.Parts = imageHeadersBuffer.getUint8(readPos + 9);
                        imageHeader.TilePositionY = imageHeadersBuffer.getUint16(readPos + 10, true);
                        imageHeader.Direction = imageHeadersBuffer.getUint8(readPos + 12);
                        imageHeader.HorizontalOffset = imageHeadersBuffer.getUint8(readPos + 13);
                        imageHeader.DrawingBoxWdith = imageHeadersBuffer.getUint8(readPos + 14);
                        imageHeader.PerformanceID = imageHeadersBuffer.getUint8(readPos + 15);
                        readPos += 16;
                        imageHeaders.push(imageHeader);
                    }
                    var imageData = new DataView(arrayBuffer, 88 + 5120 + (8 + 16) * header.ImageCount);
                    //43512 // 43512
                    console.log("endOfHeaders", imageData.byteOffset);
                    // Read image
                    var tileImages = [];
                    var tileTiles = [];
                    var imageImages = [];
                    for (var imageNumber = 0; imageNumber < header.ImageCount; imageNumber++) {
                        switch (header.DataType) {
                            case 3: {
                                // TILE + TGX Image
                                var imgHeader = imageHeaders[imageNumber];
                                var tgxTile = new DataView(arrayBuffer, imageData.byteOffset + imageOffsets[imageNumber], 512);
                                var tileBuffer = new Uint8ClampedArray(30 * 16 * 4);
                                _this.decodeTile(tgxTile, tileBuffer);
                                tileTiles.push(tileBuffer);
                                var tgxImage = new DataView(arrayBuffer, imageData.byteOffset + imageOffsets[imageNumber] + 512, imageSizes[imageNumber] - 512);
                                var imgBuffer = new Uint8ClampedArray(imgHeader.Width * imgHeader.Height * 4);
                                _this.decodeTGX(tgxImage, imgHeader, imgBuffer);
                                tileImages.push(imgBuffer);
                                break;
                            }
                            case 1: {
                                // TGX Image
                                var imgHeader = imageHeaders[imageNumber];
                                var tgxImage = new DataView(arrayBuffer, imageData.byteOffset + imageOffsets[imageNumber], imageSizes[imageNumber]);
                                var imgBuffer = new Uint8ClampedArray(imgHeader.Width * imgHeader.Height * 4);
                                _this.decodeTGX(tgxImage, imgHeader, imgBuffer);
                                imageImages.push({ image: imgBuffer, header: imgHeader });
                                break;
                            }
                            default:
                                console.error("Not implemented data type: " + header.DataType);
                        }
                    }
                    var i = 0;
                    var collections = [];
                    var currentCollection = [];
                    for (var imageNumber = 0; imageNumber < header.ImageCount; imageNumber++) {
                        var imgHeader = imageHeaders[imageNumber];
                        if (imgHeader.Part == 0) {
                            currentCollection = [];
                            collections.push(currentCollection);
                            i = 0;
                        }
                        if (imgHeader.Parts == 0) {
                            continue;
                        }
                        currentCollection.push(imageNumber);
                        if (imgHeader.Part == imgHeader.Parts - 1) {
                            currentCollection = null;
                        }
                    }
                    var collImages = [];
                    for (var _i = 0, collections_1 = collections; _i < collections_1.length; _i++) {
                        var imgNumbers = collections_1[_i];
                        var tls = [];
                        for (var _a = 0, imgNumbers_1 = imgNumbers; _a < imgNumbers_1.length; _a++) {
                            var imgNumber = imgNumbers_1[_a];
                            tls.push({
                                image: tileImages[imgNumber],
                                tile: tileTiles[imgNumber],
                                header: imageHeaders[imgNumber]
                            });
                        }
                        collImages.push({
                            offsetX: imageHeaders[0].HorizontalOffset,
                            offsetY: imageHeaders[0].TilePositionY,
                            tiles: tls
                        });
                    }
                    subscriber.next({
                        gameTiles: collImages,
                        images: imageImages,
                        path: url,
                    });
                    subscriber.complete();
                }
            };
            oReq.send(null);
        });
    };
    ImageLoader.QUANTITY_OFFSET = 12;
    ImageLoader.DATA_TYPE_OFFSET = 20;
    ImageLoader.GM1TilePixelsPerLine = [2, 6, 10, 14, 18, 22, 26, 30, 30, 26, 22, 18, 14, 10, 6, 2];
    // Header + Palette
    ImageLoader.IMAGE_OFFSET = 88 + 5120;
    return ImageLoader;
}());
exports.ImageLoader = ImageLoader;
//# sourceMappingURL=image-loader.js.map