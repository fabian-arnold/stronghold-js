import {GameTile, GM1Tile} from "../resource/image-loader";
import {Terrain} from "./terrain/terrain";
import {Camera} from "./camera";
import {Input, InputSequence} from "./input";
import {GameObject} from "./gameObject";

export class Point {
    constructor(public x: number, public y: number) {

    }
}

export class ChunkPos {
    constructor(public i: number, public j: number) {

    }
}


export class Engine {
    public camera: Camera;
    readonly movementSpeed = 900;
    private terrainCanvas: HTMLCanvasElement;
    private terrainCtx: CanvasRenderingContext2D;
    private gameContainer: HTMLDivElement;
    private terrain: Terrain;
    private tiles: GM1Tile[][] = [];
    private buildings: GameTile[] = [];
    private lastTime = (new Date()).getTime();
    private currentTime = 0;
    private delta = 0;
    private tileWidth = 16;
    private input: Input;

    private gameObjects: GameObject[] = [];

    constructor() {
        this.gameContainer = document.createElement('div');

        this.terrainCanvas = document.createElement('canvas');
        this.terrainCtx = this.terrainCanvas.getContext('2d');

        this.terrainCanvas.height = window.innerHeight;
        this.terrainCanvas.width = window.innerWidth;

        this.gameContainer.appendChild(this.terrainCanvas);
        this.input = new Input();
        this.input.register();

        this.camera = new Camera();
        this.camera.setPos(500, 100);



        this.terrain = new Terrain(this.terrainCtx, this.camera, this.tiles, 500, 500);

        this.gameObjects.push(this.terrain);
        this.gameObjects.push(this.input);

        this.terrainCanvas.onmousedown = (event) => {
            const rect = this.terrainCanvas.getBoundingClientRect();
            this.click(event.clientX - rect.left, event.clientY - rect.top);
        };

        document.body.appendChild(this.gameContainer);
    }

    public init(){
        for(let go of this.gameObjects){
            go.preInit();
        }
        for(let go of this.gameObjects){
            go.init(this);
        }
        for(let go of this.gameObjects){
            go.postInit();
        }

    }

    public static chunkForPixel(x: number, y: number): ChunkPos {
        const xMod = x % (Terrain.tileSize * 2);
        const yMod = y % Terrain.tileSize;

        const xOff = (yMod / Terrain.tileSize) * (Terrain.tileSize);
        const yOff = (xMod / (Terrain.tileSize * 2)) * Terrain.tileSize * 0.5;
        return {
            i: Math.floor((x - xOff) / (Terrain.tileSize * 2)),
            j: Math.floor((y - yOff) / (Terrain.tileSize))
        }
    }


    public addTile(tile: GM1Tile[]) {
        this.tiles.push(tile);


    }

    public start() {
        window.requestAnimationFrame(this.render.bind(this));
    }

    private click(x: number, y: number) {
        const pos: Point = {
            x: x + this.camera.getPos().x,
            y: y + this.camera.getPos().y
        };


        const cord = Engine.chunkForPixel(pos.x, pos.y);
        console.log("Click coord", cord);
        const nextTileId = (this.terrain.getTileId(cord.i, cord.j) + 1) % 3;
        //     const nextTileCount = this.tiles[nextTileId].length;

        this.terrain.setTileId(cord.i, cord.j, nextTileId);


    }

    private render() {
        window.requestAnimationFrame(this.render.bind(this));

        this.currentTime = (new Date()).getTime();
        this.delta = (this.currentTime - this.lastTime) / 1000;
        this.lastTime = this.currentTime;

        this.update();

        this.terrainCtx.fillStyle = "black";
        this.terrainCtx.fillRect(0, 0, this.terrainCanvas.width, this.terrainCanvas.height);


        this.terrainCtx.save();
        this.terrainCtx.translate(-this.camera.x, -this.camera.y);

        for(let go of this.gameObjects){
            go.preRender();
        }
        for(let go of this.gameObjects){
            go.render(this.terrainCtx);
        }
        for(let go of this.gameObjects){
            go.postRender();
        }

        this.terrainCtx.restore();

        //this.terrainCtx.fillStyle = "green";
        //this.terrainCtx.fillText("FPS: " + Math.round(1 / this.delta), 20, 20);

        //  console.log( Math.round(1 / this.delta));
        //this.terrainCtx.stroke();

    }

    private update() {
        if (this.input.isDown(InputSequence.UP)) {
            this.camera.setPos(this.camera.x, -(this.movementSpeed * this.delta) + this.camera.y);

        }
        if (this.input.isDown(InputSequence.DOWN)) {
            this.camera.setPos(this.camera.x, (this.movementSpeed * this.delta) + this.camera.y);

        }
        if (this.input.isDown(InputSequence.LEFT)) {
            this.camera.setPos(-(this.movementSpeed * this.delta) + this.camera.x, this.camera.y);

        }
        if (this.input.isDown(InputSequence.RIGHT)) {
            this.camera.setPos((this.movementSpeed * this.delta) + this.camera.x, this.camera.y);
        }


        for(let go of this.gameObjects){
            go.preUpdate();
        }
        for(let go of this.gameObjects){
            go.update();
        }
        for(let go of this.gameObjects){
            go.postUpdate();
        }
    }

}
