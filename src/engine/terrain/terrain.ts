import {Image, Tile} from "../../resource/image-loader";
import {CanvasUtil} from "../../util/canvas-util";
import {Point} from "../engine";
import {Camera} from "../camera";


class LevelTile {
    tileID: number;
    height: number;
    dirty: boolean;
}

class Chunk {

    public static readonly tileSize: number = 12;

    private dirty: boolean = true;

    private cachedImage: Image;

    private cacheCanvas: HTMLCanvasElement;
    private cacheCtx: CanvasRenderingContext2D;

    constructor(private levelData: LevelTile[][], private tiles: Tile[][], private startX: number, private startY: number, private width: number, private height: number) {

        this.cacheCanvas = document.createElement("canvas");
        this.cacheCanvas.width = width * 2 * Chunk.tileSize + 2 * Chunk.tileSize;
        this.cacheCanvas.height = height * 2 * Chunk.tileSize + 2 * Chunk.tileSize;

        this.cacheCtx = this.cacheCanvas.getContext("2d");
    }

    private static pointToCoord(point: Point): Point {
        return {
            x: ((point.y % 2) * Chunk.tileSize) + (point.x * 2 * Chunk.tileSize),
            y: point.y * Chunk.tileSize
        }
    }

    public render(ctx: CanvasRenderingContext2D) {
        if (this.dirty) {
            this.updateChunk();
        }

        ctx.drawImage(this.cacheCanvas, this.startX * 2 * Chunk.tileSize, this.startY * Chunk.tileSize);


    }

    public markDirty() {
        this.dirty = true;
    }

    private updateChunk() {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const tileId = this.levelData[this.startX + x][this.startY + y].tileID;
                this.drawTile(tileId, x, y);
            }
        }
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const tileId = this.levelData[this.startX + x][this.startY + y].tileID;
                this.drawImage(tileId, x, y);
            }
        }
        this.dirty = false;
    }

    private drawTile(type: number, i: number, j: number) {
        const tiles = this.tiles[type];
        const refTile = this.tiles[type][0];

        const _x = refTile.header.PositionX;
        const _y = refTile.header.PositionY;


        for (let tile of tiles) {
            const isoPos = Chunk.pointToCoord(new Point(i, j));
            isoPos.x += tile.header.PositionX - _x;
            isoPos.y += tile.header.PositionY + tile.header.TilePositionY - _y;


            //isoPos.y += tile.header.TilePositionY;
            CanvasUtil.putImageWithTransparency(this.cacheCtx, new ImageData(tile.tile, 30, 16), isoPos.x, isoPos.y);
        }
    }

    private drawImage(type: number, i: number, j: number) {
        const tiles = this.tiles[type];
        const refTile = this.tiles[type][0];

        const _x = refTile.header.PositionX;
        const _y = refTile.header.PositionY;

        for (let tile of tiles) {
            const isoPos = Chunk.pointToCoord(new Point(i, j));
            isoPos.x += tile.header.PositionX + tile.header.HorizontalOffset - _x;
            isoPos.y += tile.header.PositionY - _y;

            CanvasUtil.putImageWithTransparency(this.cacheCtx, new ImageData(tile.image, tile.header.Width, tile.header.Height), isoPos.x, isoPos.y);
        }
    }

}

export class Terrain {

    readonly chunkSize: number = 5;

    readonly chunkTileSize: number = 20;

    private levelData: LevelTile[][] = null;
    private chunks: Chunk[][] = [];


    private chunkCountX: number;
    private chunkCountY: number;

    constructor(private ctx: CanvasRenderingContext2D, private camera: Camera, private tiles: Tile[][], private width: number, private height: number) {

        if (width % this.chunkTileSize != 0 || height % this.chunkTileSize != 0) {
            throw new Error("Invalid chunk size.\n width / height % this.chunkTileSize must be 0")
        }

        this.chunkCountX = (this.width / this.chunkTileSize);
        this.chunkCountY = (this.height / this.chunkTileSize);

        // Initialize Level Data
        if (this.levelData == null) {
            this.levelData = [];
            for (let i = 0; i < this.width; i++) {
                const row: LevelTile[] = [];
                this.levelData.push(row);
                for (let j = 0; j < this.height; j++) {
                    row.push({tileID: 0, height: 0, dirty: true});
                }
            }
        }

        // Create Chunks
        for (let x = 0; x < this.chunkCountX; x++) {
            this.chunks[x] = [];
            for (let y = 0; y < this.chunkCountY; y++) {
                this.chunks[x][y] = new Chunk(this.levelData, this.tiles, x * 20, y * 20, 20, 20);
            }
        }


    }

    public render() {

        // Half tile size offset value
        const startX = Math.max(Math.floor((this.camera.x - Chunk.tileSize) / (this.chunkTileSize * Chunk.tileSize * 2)), 0);
        const startY = Math.max(Math.floor((this.camera.y - Chunk.tileSize / 2) / (this.chunkTileSize * Chunk.tileSize)), 0);

        const endX = Math.min(Math.ceil((this.camera.x + this.ctx.canvas.width) / (this.chunkTileSize * Chunk.tileSize * 2)), this.chunkCountX);
        const endY = Math.min(Math.ceil((this.camera.y + this.ctx.canvas.height) / (this.chunkTileSize * Chunk.tileSize)), this.chunkCountY);


        console.log("Start", startY);
        console.log("End", endY);
        for (let x = startX; x < endX; x++) {
            for (let y = startY; y < endY; y++) {
                this.chunks[x][y].render(this.ctx);
            }
        }
    }

}