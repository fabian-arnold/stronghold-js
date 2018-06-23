import {Observable} from 'rxjs';
// program.js
import {load} from "webassembly";
import {CanvasUtil} from "../util/canvas-util";


export class Image {
    width: number;
    height: number;
    offsetX: number;
    offsetY: number;
    imageData: Uint8ClampedArray;
}


class GM1Header {
    ImageCount: number;
    DataType: number;
    SizeType: number;
    DataSize: number;
}

class GM1ImageHeader {
    Width: number;
    Height: number;
    PositionX: number;
    PositionY: number;
    Part: number;
    Parts: number;
    TilePositionY: number;
    Direction: number;
    HorizontalOffset: number;
    DrawingBoxWdith: number;
    PerformanceID: number;
}

class GM1EntryInfo {
    Offset: number;
    Size: number;
    Header: number;
    Image: Image;
    Tile: Tile;
}

export class Tile {
    header: GM1ImageHeader;
    image: Uint8ClampedArray;
    tile: Uint8ClampedArray;
}

export class GameTile {
    offsetX: number;
    offsetY: number;
    imageData: ImageData;
    tiles: Tile[];
}

export class ImageLoader {
    static QUANTITY_OFFSET = 12;
    static DATA_TYPE_OFFSET = 20;
    static GM1TilePixelsPerLine = [2, 6, 10, 14, 18, 22, 26, 30, 30, 26, 22, 18, 14, 10, 6, 2];
// Header + Palette
    static IMAGE_OFFSET = 88 + 5120;

    constructor() {
        load("gm1parser.wasm")
            .then(module => {
                console.log("1 + 2 = " + module.exports.add(1, 2));
            });
        console.log("Created image loader");
    }

    decodeTile(tileData: DataView, data: Uint8ClampedArray) {
        let readPos = 0;
        for (let c_y = 0; c_y < ImageLoader.GM1TilePixelsPerLine.length; c_y++) {
            for (let c_x = 0; c_x < ImageLoader.GM1TilePixelsPerLine[c_y]; c_x++) {
                const y = c_y;
                const x = 15 - ImageLoader.GM1TilePixelsPerLine[y] / 2 + c_x;

                // console.log("Decode Tile: " + x + " " + y);
                const pos = (y * 30 + x) * 4;
                const color = tileData.getUint16(readPos, true);
                this.writeColor(data, pos, color);
                readPos += 2;
            }
        }
    }

    writeColor(data: Uint8ClampedArray, pos: number, color: number) {

        const blue = color & 0b11111;
        const red = (color >> 10) & 0b11111;
        const green = (color >> 5) & 0b11111;

        data[pos + 0] = red * 8;
        data[pos + 1] = green * 8;
        data[pos + 2] = blue * 8;
        data[pos + 3] = 255;
    }

    decodeTGX(imageData: DataView, header: GM1ImageHeader, data: Uint8ClampedArray) {
        let x = 0;
        let y = 0;
        let readPos = 0;
        while (true) {
            if (readPos + 1 > imageData.byteLength) {
                break;
            }
            const tokenType = (imageData.getUint8(readPos) >> 5) & 0b111;
            const tokenLength = imageData.getUint8(readPos) & 0b11111;

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
                for (let i = 0; i < tokenLength + 1; i++) {
                    const pos = ((y) * header.Width + (x)) * 4;
                    const color = imageData.getUint16(readPos, true);
                    this.writeColor(data, pos, color);
                    x++;
                    readPos += 2;
                }
                continue;
            }

            if (tokenType == 2) {
                // repeating pixel
                const color = imageData.getUint16(readPos, true);
                readPos += 2;

                for (let i = 0; i < tokenLength + 1; i++) {
                    const pos = ((y) * header.Width + (x)) * 4;
                    this.writeColor(data, pos, color);
                    x++;
                }
                continue;
            }
            console.error("Invalid token type");
            break;
        }
    }

    parseGM1Header(header: GM1Header, dataView: DataView) {
        header.ImageCount = dataView.getInt32(12, true);
        header.DataType = dataView.getInt32(20, true);
    }


    loadImage(url: string): Observable<GameTile[]> {
        const oReq = new XMLHttpRequest();
        oReq.open("GET", url, true);
        // oReq.open("GET", "gm/tile_goods.gm1", true);
        oReq.responseType = "arraybuffer";

        console.log("Loading image...");
        return new Observable<GameTile[]>(subscriber => {
            oReq.onload = oEvent => {
                const arrayBuffer = oReq.response; // Note: not oReq.responseText
                if (arrayBuffer) {
                    const header = new GM1Header();
                    const headerDataView = new DataView(arrayBuffer, 0, 88);
                    this.parseGM1Header(header, headerDataView);

                    const paletteDataView = new DataView(arrayBuffer, 88, 5120);
                    console.log("Header data", headerDataView);

                    const imageOffsets = new Uint32Array(arrayBuffer, 5120 + 88, 4 * header.ImageCount);
                    const imageSizes = new Uint32Array(arrayBuffer, 5120 + 88 + 4 * header.ImageCount, 4 * header.ImageCount);


                    const imageHeadersBuffer = new DataView(arrayBuffer, 88 + 5120 + 8 * header.ImageCount);
                    const imageHeaders: GM1ImageHeader[] = [];
                    // Read image
                    let readPos = 0;
                    for (let imageNumber = 0; imageNumber < header.ImageCount; imageNumber++) {
                        const imageHeader = new GM1ImageHeader();

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


                    const imageData = new DataView(arrayBuffer, 88 + 5120 + (8 + 16) * header.ImageCount);


                    //43512 // 43512
                    console.log("endOfHeaders", imageData.byteOffset);
                    // Read image
                    const images: Uint8ClampedArray[] = [];
                    const tiles: Uint8ClampedArray[] = [];

                    for (let imageNumber = 0; imageNumber < header.ImageCount; imageNumber++) {

                        switch (header.DataType) {
                            case 3:
                                const imgHeader = imageHeaders[imageNumber];

                                const tgxTile = new DataView(arrayBuffer, imageData.byteOffset + imageOffsets[imageNumber], 512);
                                const tileBuffer = new Uint8ClampedArray(30 * 16 * 4);
                                this.decodeTile(tgxTile, tileBuffer);
                                tiles.push(tileBuffer);

                                const tgxImage = new DataView(arrayBuffer, imageData.byteOffset + imageOffsets[imageNumber] + 512, imageSizes[imageNumber] - 512);
                                const imgBuffer = new Uint8ClampedArray(imgHeader.Width * imgHeader.Height * 4);
                                this.decodeTGX(tgxImage, imgHeader, imgBuffer);
                                images.push(imgBuffer);
                                break;
                            default:
                                console.error("Not implemented data type: " + header.DataType);
                        }

                    }

                    // create off-screen canvas element
                    const canvas = document.createElement('canvas'),
                        ctx = canvas.getContext('2d');


                    let i = 0;
                    const collections: number[][] = [];
                    let currentCollection: number[] = [];
                    for (let imageNumber = 0; imageNumber < header.ImageCount; imageNumber++) {
                        const imgHeader = imageHeaders[imageNumber];
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

                    console.log(collections);
                    const collImages: GameTile[] = [];
                    for (const imgNumbers of collections) {

                        //bounding box
                        let top = Infinity;
                        let left = Infinity;
                        let bottom = 0;
                        let right = 0;

                        for (const imgNumber of imgNumbers) {
                            //find bounds of the sub-images
                            const x = imageHeaders[imgNumber].PositionX;
                            const y = imageHeaders[imgNumber].PositionY;
                            const w = imageHeaders[imgNumber].Width;
                            const h = imageHeaders[imgNumber].Height;

                            left = Math.min(left, x);
                            top = Math.min(top, y);
                            right = Math.max(right, x + w);
                            bottom = Math.max(bottom, y + h);
                        }
                        //calculate the actual dimensions of the image
                        const width = right - left;
                        const height = bottom - top;

                        //create canvas for image
                        canvas.height = height;
                        canvas.width = width;
                        ctx.clearRect(0, 0, width, height);


                        const tls: Tile[] = [];
                        //draw all entities of the collection
                        for (const imgNumber of imgNumbers) {
                            //draw the tile part
                            let x = imageHeaders[imgNumber].PositionX - left;
                            let y = imageHeaders[imgNumber].PositionY + imageHeaders[imgNumber].TilePositionY - top;

                           // CanvasUtil.putImageWithTransparency(ctx, new ImageData(tiles[imgNumber], 30, 16), x, y)
                            ctx.fillText(imgNumber + "", x, y);
                            //draw the image part
                            x = imageHeaders[imgNumber].PositionX + imageHeaders[imgNumber].HorizontalOffset - left;
                            y = imageHeaders[imgNumber].PositionY - top;

                           // CanvasUtil.putImageWithTransparency(ctx, new ImageData(images[imgNumber], imageHeaders[imgNumber].Width, imageHeaders[imgNumber].Height), x, y);
                            //ctx.putImageData(, x, y, 0, 0, imageHeaders[imgNumber].DrawingBoxWdith, imageHeaders[imgNumber].Height);

                            tls.push({
                                image: images[imgNumber],
                                tile: tiles[imgNumber],
                                header: imageHeaders[imgNumber]
                            })

                            //rect = image.Rect(x, y, x+int(collection[i].Header.DrawingBoxWdith), y+int(collection[i].Header.Height))
                            //draw.Draw(img, rect, collection[i].Image.data, image.ZP, draw.Over)

                            //Note: E.g. Buildings consist of tiles (foundation) and images (walls etc.)
                        }
                        collImages.push({
                            imageData: ctx.getImageData(0, 0, width, height),
                            offsetX: imageHeaders[0].HorizontalOffset,
                            offsetY: imageHeaders[0].TilePositionY,
                            tiles: tls
                        });

                    }

                    canvas.width = 1400;
                    canvas.height = 3000;

                    let lastCanvasX = 0;
                    let lastCanvasY = 20;
                    let maxCanvasHeight = 0;
                    let d = 0;
                    for (let img of collImages) {
                        ctx.putImageData(img.imageData, lastCanvasX, lastCanvasY);
                        ctx.rect(lastCanvasX - 5, lastCanvasY - 5, img.imageData.width + 5, img.imageData.height + 5);
                        ctx.stroke();
                        ctx.fillText(d++ + "", lastCanvasX, lastCanvasY - 7);
                        lastCanvasX += img.imageData.width + 20;
                        maxCanvasHeight = Math.max(maxCanvasHeight, img.imageData.height);
                        if (lastCanvasX > 1000) {
                            lastCanvasX = 10;
                            lastCanvasY += maxCanvasHeight + 20;
                            maxCanvasHeight = 0;
                        }
                    }

                    subscriber.next(collImages);
                    subscriber.complete();
                    document.body.appendChild(canvas);

                }


            }

            oReq.send(null);
        });


    }
}