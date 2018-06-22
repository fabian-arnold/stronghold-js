import {GameTile} from "../resource/image-loader";
import {CanvasUtil} from "../util/canvas-util";

export namespace strongholdjs {
    export class Point {
        constructor(public x: number, public y: number) {

        }
    }

    export class Engine {
        private canvas: HTMLCanvasElement;
        private ctx: CanvasRenderingContext2D;


        private levelData =
            [[1, 1, 1, 1, 1, 1],
                [1, 0, 0, 2, 0, 1],
                [1, 0, 1, 0, 0, 1],
                [1, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1]];
        private tiles: GameTile[] = [];

        constructor() {
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
            this.canvas.height = 768;
            this.canvas.width = 1024;

            document.body.appendChild(this.canvas);
        }

        public addTile(tile: GameTile) {
            this.tiles.push(tile);


        }

        public start() {
            window.requestAnimationFrame(this.render.bind(this));
        }

        private render() {
            this.ctx.fillStyle = "black";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            let tileType = 0;
            for (let i: number = 0; i < this.levelData.length; i++) {
                for (let j: number = 0; j < this.levelData[0].length; j++) {
                    tileType = this.levelData[i][j];
                    this.placeTile(tileType, i, j);
                    if (tileType == 2) {
                        this.levelData[i][j] = 0;
                    }
                }
            }

            window.requestAnimationFrame(this.render.bind(this));
        }

        private tileWidth = 16;

        private placeTile(type: number, i: number, j: number) {
            const pos = new Point(i * this.tileWidth, j * this.tileWidth);
            const isoPos = Engine.twoDToIso(pos);
            CanvasUtil.putImageWithTransparency(this.ctx, this.tiles[type].imageData, isoPos.x + 300, isoPos.y + 100);
        }


        public static isoTo2D(pt: Point): Point {
            const tempPt: Point = new Point(0, 0);
            tempPt.x = (2 * pt.y + pt.x) / 2;
            tempPt.y = (2 * pt.y - pt.x) / 2;
            return (tempPt);
        }

        public static twoDToIso(pt: Point): Point {
            const tempPt: Point = new Point(0, 0);
            tempPt.x = pt.x - pt.y;
            tempPt.y = (pt.x + pt.y) / 2;
            return (tempPt);
        }


        public static getTileCoordinates(pt: Point, tileHeight: number): Point {
            const tempPt: Point = new Point(0, 0);
            tempPt.x = Math.floor(pt.x / tileHeight);
            tempPt.y = Math.floor(pt.y / tileHeight);

            return (tempPt);
        }


        public static get2dFromTileCoordinates(pt: Point, tileHeight: number): Point {
            const tempPt: Point = new Point(0, 0);
            tempPt.x = pt.x * tileHeight;
            tempPt.y = pt.y * tileHeight;

            return (tempPt);
        }

    }
}
