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


    private dirty: boolean = true;

    private cachedImage: Image;

    private cacheCanvas: HTMLCanvasElement;
    private cacheCtx: CanvasRenderingContext2D;

    constructor(private levelData: LevelTile[][], private tiles: Tile[][], private startI: number, private startJ: number, private countI: number, private countJ: number) {

        this.cacheCanvas = document.createElement("canvas");
        this.cacheCanvas.width = countI * 2 * Terrain.tileSize + 2 * Terrain.tileSize;
        this.cacheCanvas.height = countJ * Terrain.tileSize + Terrain.tileSize;

        this.cacheCtx = this.cacheCanvas.getContext("2d");
    }

    private static pointToCoord(point: Point): Point {
        return {
            x: ((point.y % 2) * Terrain.tileSize) + (point.x * 2 * Terrain.tileSize),
            y: point.y * Terrain.tileSize
        }
    }

    public render(ctx: CanvasRenderingContext2D) {
        if (this.dirty) {
            this.updateChunk();
        }

        ctx.drawImage(this.cacheCanvas, this.startI * 2 * Terrain.tileSize, this.startJ * Terrain.tileSize);


    }

    public markDirty() {
        this.dirty = true;
    }

    private updateChunk() {
        for (let i = 0; i < this.countI; i++) {
            for (let j = 0; j < this.countJ; j++) {
                const tileId = this.levelData[this.startI + i][this.startJ + j].tileID;
                this.drawTile(tileId, i, j);
            }
        }
        for (let i = 0; i < this.countI; i++) {
            for (let j = 0; j < this.countJ; j++) {
                const tileId = this.levelData[this.startI + i][this.startJ + j].tileID;
                this.drawImage(tileId, i, j);
            }
        }
        this.dirty = false;
        this.cacheCtx.strokeStyle = "red";
        this.cacheCtx.rect(0, 0, this.cacheCanvas.width, this.cacheCanvas.height);
        this.cacheCtx.stroke();
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

    public static readonly tileSize: number = 12;

    readonly chunkTileSize: number = 20;

    private levelData: LevelTile[][] = null;
    private chunks: Chunk[][] = [];


    private chunkCountI: number;
    private chunkCountJ: number;

    constructor(private ctx: CanvasRenderingContext2D, private camera: Camera, private tiles: Tile[][], private width: number, private height: number) {

        if (width % this.chunkTileSize != 0 || height % this.chunkTileSize != 0) {
            throw new Error("Invalid chunk size.\n width / height % this.chunkTileSize must be 0")
        }

        this.chunkCountI = (this.width / this.chunkTileSize);
        this.chunkCountJ = (this.height / this.chunkTileSize);

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
        for (let i = 0; i < this.chunkCountI; i++) {
            this.chunks[i] = [];
            for (let j = 0; j < this.chunkCountJ; j++) {
                this.chunks[i][j] = new Chunk(this.levelData, this.tiles, i * this.chunkTileSize, j * this.chunkTileSize, this.chunkTileSize, this.chunkTileSize);
            }
        }


    }

    public setTileId(i: number, j: number, tileId: number) {
        this.levelData[i][j].tileID = tileId;
        this.chunks[Math.floor(i / this.chunkTileSize)][Math.floor(j / this.chunkTileSize)].markDirty();
    }

    public getTileId(i: number, j: number): number {
        return this.levelData[i][j].tileID;
    }

    public render() {

        // Half tile size offset value
        const startI = Math.max(Math.floor((this.camera.x - Terrain.tileSize) / (this.chunkTileSize * Terrain.tileSize * 2)), 0);
        const startJ = Math.max(Math.floor((this.camera.y - Terrain.tileSize / 2) / (this.chunkTileSize * Terrain.tileSize)), 0);

        const endI = Math.min(Math.ceil((this.camera.x + this.ctx.canvas.width) / (this.chunkTileSize * Terrain.tileSize * 2)), this.chunkCountI);
        const endJ = Math.min(Math.ceil((this.camera.y + this.ctx.canvas.height) / (this.chunkTileSize * Terrain.tileSize)), this.chunkCountJ);

        for (let x = startI; x < endI; x++) {
            for (let y = startJ; y < endJ; y++) {
                this.chunks[x][y].render(this.ctx);
            }
        }
    }

}