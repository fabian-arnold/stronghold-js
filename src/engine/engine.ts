import {GameTile, GM1Tile} from "../resource/gm1-loader";
import {Terrain} from "./terrain/terrain";
import {Camera} from "./camera";
import {Input, InputSequence} from "./input";
import {GameObject} from "./gameObject";
import {Gui} from "../gui/gui";
import {ResourceManager} from "../resource/resource-manager";

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
    private tiles: GM1Tile[][] = [];
    private buildings: GameTile[] = [];
    private lastTime = (new Date()).getTime();
    private currentTime = 0;
    private delta = 0;
    private tileWidth = 16;
    private gameObjects: GameObject[] = [];

    constructor(public resourceManager: ResourceManager) {
        this._gameContainer = document.createElement('div');

        this.terrainCanvas = document.createElement('canvas');
        this.terrainCtx = this.terrainCanvas.getContext('2d');

        this.terrainCanvas.height = window.innerHeight;
        this.terrainCanvas.width = window.innerWidth;

        if (window.innerWidth < 1280) {
            this.terrainCanvas.width = 1024;
        } else if (window.innerWidth < 1360) {
            this.terrainCanvas.width = 1280;
        } else if (window.innerWidth < 1366) {
            this.terrainCanvas.width = 1360;
        } else if (window.innerWidth < 1440) {
            this.terrainCanvas.width = 1366;
        } else if (window.innerWidth < 1600) {
            this.terrainCanvas.width = 1440;
        } else if (window.innerWidth < 1680) {
            this.terrainCanvas.width = 1600;
        } else if (window.innerWidth < 1920) {
            this.terrainCanvas.width = 1680;
        } else if (window.innerWidth < 2560) {
            this.terrainCanvas.width = 1920;
        } else {
            this.terrainCanvas.width = 2560;
        }

        this.gameContainer.style.width = this.terrainCanvas.width + "px";
        this.gameContainer.style.position = "relative";
        this._gameContainer.appendChild(this.terrainCanvas);
        this._input = new Input();
        this._input.register(this.terrainCanvas);

        this.camera = new Camera();
        this.camera.setPos(500, 100);


        this._terrain = new Terrain(this.terrainCtx, this.camera, this.tiles, 500, 500);

        this.gameObjects.push(this._terrain);
        this.gameObjects.push(this._input);
        this.gameObjects.push(new Gui());


        document.body.appendChild(this._gameContainer);
    }

    private _terrain: Terrain;

    get terrain(): Terrain {
        return this._terrain;
    }

    private _input: Input;

    get input(): Input {
        return this._input;
    }

    private _gameContainer: HTMLDivElement;

    get gameContainer(): HTMLDivElement {
        return this._gameContainer;
    }

    get gameWidth(): number {
        return this.terrainCanvas.width;
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

    public init() {
        for (let go of this.gameObjects) {
            go.preInit();
        }
        for (let go of this.gameObjects) {
            go.init(this);
        }
        for (let go of this.gameObjects) {
            go.postInit();
        }

    }

    public addTile(tile: GM1Tile[]) {
        this.tiles.push(tile);


    }

    public start() {
        window.requestAnimationFrame(this.render.bind(this));
    }

    private click(x: number, y: number) {
        //
        // console.log("Click coord", cord);
        // const nextTileId = (this.terrain.getTileId(cord.i, cord.j) + 1) % 3;
        // //     const nextTileCount = this.tiles[nextTileId].length;
        //
        // this.terrain.setTileId(cord.i, cord.j, nextTileId);


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

        for (let go of this.gameObjects) {
            go.preRender();
        }
        for (let go of this.gameObjects) {
            go.render(this.terrainCtx);
        }
        for (let go of this.gameObjects) {
            go.postRender();
        }

        this.terrainCtx.restore();

        //this.terrainCtx.fillStyle = "green";
        //this.terrainCtx.fillText("FPS: " + Math.round(1 / this.delta), 20, 20);

        //  console.log( Math.round(1 / this.delta));
        //this.terrainCtx.stroke();

    }

    private update() {
        if (this._input.isDown(InputSequence.UP)) {
            this.camera.setPos(this.camera.x, -(this.movementSpeed * this.delta) + this.camera.y);

        }
        if (this._input.isDown(InputSequence.DOWN)) {
            this.camera.setPos(this.camera.x, (this.movementSpeed * this.delta) + this.camera.y);

        }
        if (this._input.isDown(InputSequence.LEFT)) {
            this.camera.setPos(-(this.movementSpeed * this.delta) + this.camera.x, this.camera.y);

        }
        if (this._input.isDown(InputSequence.RIGHT)) {
            this.camera.setPos((this.movementSpeed * this.delta) + this.camera.x, this.camera.y);
        }


        for (let go of this.gameObjects) {
            go.preUpdate();
        }
        for (let go of this.gameObjects) {
            go.update();
        }
        for (let go of this.gameObjects) {
            go.postUpdate();
        }
    }

}
