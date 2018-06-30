import {Observable} from 'rxjs';

// program.js


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
    Tile: GM1Tile;
}

export class GM1Tile {
    header: GM1ImageHeader;
    image: Uint8ClampedArray;
    tile: Uint8ClampedArray;
}

export class GM1Image {
    header: GM1ImageHeader;
    image: Uint8ClampedArray;
}

export class GameTile {
    offsetX: number;
    offsetY: number;
    tiles: GM1Tile[];
}

export class GM1Resource {
    gameTiles: GameTile[];
    images: GM1Image[];
    path: string;
}

export class ImageLoader {
    static QUANTITY_OFFSET = 12;
    static DATA_TYPE_OFFSET = 20;
    static GM1TilePixelsPerLine = [2, 6, 10, 14, 18, 22, 26, 30, 30, 26, 22, 18, 14, 10, 6, 2];
    // Header + Palette
    static IMAGE_OFFSET = 88 + 5120;

    constructor() {

        console.log("Created image loader");
    }

    decodeTile(tileData: DataView, data: Uint8ClampedArray) {
        let readPos = 0;
        for (let c_y = 0; c_y < ImageLoader.GM1TilePixelsPerLine.length; c_y++) {
            for (let c_x = 0; c_x < ImageLoader.GM1TilePixelsPerLine[c_y]; c_x++) {
                const y = c_y;
                const x = 15 - ImageLoader.GM1TilePixelsPerLine[y] / 2 + c_x;

                // console.log("Decode GM1Tile: " + x + " " + y);
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


    loadImage(url: string): Observable<GM1Resource> {
        const oReq = new XMLHttpRequest();
        oReq.open("GET", url, true);
        // oReq.open("GET", "gm/tile_goods.gm1", true);
        oReq.responseType = "arraybuffer";

        console.log("Loading image...");
        return new Observable<GM1Resource>(subscriber => {
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
                    const tileImages: Uint8ClampedArray[] = [];
                    const tileTiles: Uint8ClampedArray[] = [];
                    const imageImages: GM1Image[] = [];

                    for (let imageNumber = 0; imageNumber < header.ImageCount; imageNumber++) {

                        switch (header.DataType) {
                            case 3: {
                                // TILE + TGX Image
                                const imgHeader = imageHeaders[imageNumber];

                                const tgxTile = new DataView(arrayBuffer, imageData.byteOffset + imageOffsets[imageNumber], 512);
                                const tileBuffer = new Uint8ClampedArray(30 * 16 * 4);
                                this.decodeTile(tgxTile, tileBuffer);
                                tileTiles.push(tileBuffer);

                                const tgxImage = new DataView(arrayBuffer, imageData.byteOffset + imageOffsets[imageNumber] + 512, imageSizes[imageNumber] - 512);
                                const imgBuffer = new Uint8ClampedArray(imgHeader.Width * imgHeader.Height * 4);
                                this.decodeTGX(tgxImage, imgHeader, imgBuffer);
                                tileImages.push(imgBuffer);
                                break;
                            }
                            case 1: {
                                // TGX Image
                                const imgHeader = imageHeaders[imageNumber];
                                const tgxImage = new DataView(arrayBuffer, imageData.byteOffset + imageOffsets[imageNumber], imageSizes[imageNumber]);
                                const imgBuffer = new Uint8ClampedArray(imgHeader.Width * imgHeader.Height * 4);
                                this.decodeTGX(tgxImage, imgHeader, imgBuffer);
                                imageImages.push({image: imgBuffer, header: imgHeader});
                                break;
                            }
                            default:
                                console.error("Not implemented data type: " + header.DataType);
                        }

                    }

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


                    const collImages: GameTile[] = [];
                    for (const imgNumbers of collections) {

                        const tls: GM1Tile[] = [];

                        for (const imgNumber of imgNumbers) {
                            tls.push({
                                image: tileImages[imgNumber],
                                tile: tileTiles[imgNumber],
                                header: imageHeaders[imgNumber]
                            })
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


    }
}