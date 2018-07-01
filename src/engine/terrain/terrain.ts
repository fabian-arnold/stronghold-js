import {GM1Tile, Image} from "../../resource/gm1-loader";
import {CanvasUtil} from "../../util/canvas-util";
import {ChunkPos, Point} from "../engine";
import {Camera} from "../camera";
import {GameObject} from "../gameObject";
import SimplexNoise = require("simplex-noise");


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

    constructor(private levelData: LevelTile[][], private tiles: GM1Tile[][], private startI: number, private startJ: number, private countI: number, private countJ: number) {

        this.cacheCanvas = document.createElement("canvas");
        this.cacheCanvas.width = countI * 2 * Terrain.tileSize + 2 * Terrain.tileSize;
        this.cacheCanvas.height = countJ * Terrain.tileSize + Terrain.tileSize;

        this.cacheCtx = this.cacheCanvas.getContext("2d");
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

    public preRender() {
        if (this.dirty) {
            this.updateChunk();
        }
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
            const isoPos = Terrain.pointToCoord(new ChunkPos(i, j));
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
            const isoPos = Terrain.pointToCoord(new ChunkPos(i, j));
            isoPos.x += tile.header.PositionX + tile.header.HorizontalOffset - _x;
            isoPos.y += tile.header.PositionY - _y;

            CanvasUtil.putImageWithTransparency(this.cacheCtx, new ImageData(tile.image, tile.header.Width, tile.header.Height), isoPos.x, isoPos.y);
        }
    }

}

export class Terrain extends GameObject {

    public static readonly tileSize: number = 12;

    readonly chunkTileSize: number = 50;

    private levelData: LevelTile[][] = null;
    private chunks: Chunk[][] = [];


    private chunkCountI: number;
    private chunkCountJ: number;

    private gen = new SimplexNoise();

    constructor(private ctx: CanvasRenderingContext2D, private camera: Camera, private tiles: GM1Tile[][], private width: number, private height: number) {
        super();
        if (width % this.chunkTileSize != 0 || height % (this.chunkTileSize * 2) != 0) {
            throw new Error("Invalid chunk size.\n width / height % this.chunkTileSize must be 0")
        }

        this.chunkCountI = (this.width / this.chunkTileSize);
        this.chunkCountJ = (this.height / (this.chunkTileSize * 2));

        // Initialize Level Data
        if (this.levelData == null) {

            this.levelData = [];
            for (let i = 0; i < this.width; i++) {
                const row: LevelTile[] = [];
                this.levelData.push(row);
                for (let j = 0; j < this.height; j++) {

                    let nx = i / width - 0.5, ny = j / height - 0.5;


                    const tileId = Math.min(2, Math.max(0, Math.floor((this.noise(nx, ny) * 3))));
                    //console.log(tileId);
                    row.push({tileID: tileId, height: 0, dirty: true});
                }
            }
        }

        // Create Chunks
        for (let i = 0; i < this.chunkCountI; i++) {
            this.chunks[i] = [];
            for (let j = 0; j < this.chunkCountJ; j++) {
                this.chunks[i][j] = new Chunk(this.levelData, this.tiles, i * this.chunkTileSize, j * this.chunkTileSize * 2, this.chunkTileSize, this.chunkTileSize * 2);
                //this.chunks[i][j].preRender();
            }
        }


    }

    public static pointToCoord(point: ChunkPos): Point {
        return {
            x: ((point.j % 2) * Terrain.tileSize) + (point.i * 2 * Terrain.tileSize),
            y: point.j * Terrain.tileSize
        }
    }

    public setTileId(i: number, j: number, tileId: number) {
        this.levelData[i][j].tileID = tileId;
        this.chunks[Math.floor(i / this.chunkTileSize)][Math.floor(j / (this.chunkTileSize * 2))].markDirty();
    }

    public getTileId(i: number, j: number): number {
        return this.levelData[i][j].tileID;
    }

    public init() {

        for (let i = 0; i < this.chunkCountI; i++) {
            for (let j = 0; j < this.chunkCountJ; j++) {
                //FIXME removed due to loading performance
                //       this.chunks[i][j].preRender();
            }
        }
    }

    public render() {

        // Half tile size offset value
        const startI = Math.max(Math.floor((this.camera.x - Terrain.tileSize) / (this.chunkTileSize * Terrain.tileSize * 2)), 0);
        const startJ = Math.max(Math.floor((this.camera.y - Terrain.tileSize / 2) / (this.chunkTileSize * 2 * Terrain.tileSize)), 0);

        const endI = Math.min(Math.ceil((this.camera.x + this.ctx.canvas.width) / (this.chunkTileSize * Terrain.tileSize * 2)), this.chunkCountI);
        const endJ = Math.min(Math.ceil((this.camera.y + this.ctx.canvas.height) / (this.chunkTileSize * 2 * Terrain.tileSize)), this.chunkCountJ);

        for (let x = startI; x < endI; x++) {
            for (let y = startJ; y < endJ; y++) {
                this.chunks[x][y].render(this.ctx);
            }
        }
    }

    private noise(nx: number, ny: number) {
        // Rescale from -1.0:+1.0 to 0.0:1.0
        return this.gen.noise2D(nx * 4, ny * 4) / 2 + 0.5;
    }

}