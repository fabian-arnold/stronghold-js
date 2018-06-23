import {GameTile, Tile} from "../resource/image-loader";
import {CanvasUtil} from "../util/canvas-util";

export namespace strongholdjs {
    export class Point {
        constructor(public x: number, public y: number) {

        }
    }

    class LevelTile {
        tileID: number;
        height: number;
    }

    export class Engine {
        private canvas: HTMLCanvasElement;
        private ctx: CanvasRenderingContext2D;

        public camera: Point;


        private levelData: LevelTile[][] = null;
        private tiles: Tile[][] = [];
        private buildings: GameTile[] = [];

        constructor() {
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
            this.canvas.height = 768;
            this.canvas.width = 1024;

            this.camera = {x: 200, y: 100};

            if (this.levelData == null) {
                this.levelData = [];
                for (let i = 0; i < 160; i++) {
                    const row: LevelTile[] = [];
                    this.levelData.push(row);
                    for (let j = 0; j < 160; j++) {
                        row.push({tileID: 0, height: 0});
                    }
                }
            }

            this.canvas.onmousedown = (event) => {
                const rect = this.canvas.getBoundingClientRect();
                this.click(event.clientX - rect.left, event.clientY - rect.top);
            };

            document.body.appendChild(this.canvas);
        }

        private click(x: number, y: number) {
            const pos: Point = {
                x: x - this.camera.x,
                y: y - this.camera.y
            };

            const cord = Engine.getTileCoordinates(Engine.isoTo2D(pos), this.tileWidth);

            const nextTileId = this.levelData[cord.x][cord.y].tileID + 1;
            const nextTileCount = this.tiles[nextTileId].length;

            this.levelData[cord.x][cord.y].tileID = nextTileId;
            this.levelData[cord.x][cord.y].height = 1;


        }

        public addTile(tile: Tile[]) {
            this.tiles.push(tile);


        }

        public start() {
            window.requestAnimationFrame(this.render.bind(this));
        }

        private render() {
            this.ctx.fillStyle = "black";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            let drawTile: LevelTile;


            for (let h = 0; h < 10; h++) {
                for (let i: number = 0; i < this.levelData.length; i++) {
                    for (let j: number = 0; j < this.levelData[0].length; j++) {
                        drawTile = this.levelData[i][j];
                        //  if (drawTile.tileID == 0) continue;
                        if (drawTile.height == h) {
                            this.drawTile(drawTile.tileID, i, j);
                            this.drawImage(drawTile.tileID, i, j);
                        }

                    }
                }
            }

            window.requestAnimationFrame(this.render.bind(this));
        }

        private tileWidth = 16;

        private drawTile(type: number, i: number, j: number) {
            const pos = new Point(i * this.tileWidth, j * this.tileWidth);
            pos.x += this.camera.x;
            pos.y += this.camera.y;

            const tiles = this.tiles[type];
            const refTile = this.tiles[type][0];

            const _x = refTile.header.PositionX;
            const _y = refTile.header.PositionY;


            for (let tile of tiles) {
                const isoPos = Engine.twoDToIso(pos);
                isoPos.x += tile.header.PositionX - _x;
                isoPos.y += tile.header.PositionY + tile.header.TilePositionY - _y;


                //isoPos.y += tile.header.TilePositionY;
                CanvasUtil.putImageWithTransparency(this.ctx, new ImageData(tile.tile, 30, 16), isoPos.x, isoPos.y);
            }
        }

        private drawImage(type: number, i: number, j: number) {
            const pos = new Point(i * this.tileWidth, j * this.tileWidth);
            pos.x += this.camera.x;
            pos.y += this.camera.y;
            const isoPos = Engine.twoDToIso(pos);

            const tiles = this.tiles[type];
            const refTile = this.tiles[type][0];

            const _x = refTile.header.PositionX;
            const _y = refTile.header.PositionY;

            for (let tile of tiles) {
                const isoPos = Engine.twoDToIso(pos);
                isoPos.x += tile.header.PositionX + tile.header.HorizontalOffset - _x;
                isoPos.y += tile.header.PositionY - _y;

                CanvasUtil.putImageWithTransparency(this.ctx, new ImageData(tile.image, tile.header.Width, tile.header.Height), isoPos.x, isoPos.y);
            }
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
