import {Observable} from "rxjs/internal/Observable";
import {forkJoin} from "rxjs/internal/observable/forkJoin";
import {GameTile, GM1Resource, ImageLoader} from "./image-loader";
import {IHash} from "../util/hash-maps";
import {CanvasUtil} from "../util/canvas-util";

export enum ResourceCollections {
    CASTLES = "gm/tile_castle.gm1",
    GRASSLANDS = "gm/tile_land_macros.gm1",
    STONELANDS = "gm/tile_land8.gm1",
    STOCKPILES = "gm/tile_goods.gm1",
}


export class ResourceManager {

    private files: string[] =
        [ResourceCollections.CASTLES,
            ResourceCollections.GRASSLANDS,
            ResourceCollections.STONELANDS,
            ResourceCollections.STOCKPILES];

    private imageLoader: ImageLoader;

    constructor() {
        this.imageLoader = new ImageLoader();
    }

    private resources: IHash<GM1Resource> = {};

    public loadResources(): Observable<void> {
        return new Observable<void>(subscriber => {
            forkJoin(this.files.map(path => this.imageLoader.loadImage(path))).subscribe((data: GM1Resource[]) => {
                for (let res of data) {
                    this.resources[res.path] = res;
                }
                subscriber.next();
                subscriber.complete();
            });
        });
    }

    public getResources(resCollection: ResourceCollections): GM1Resource {
        return this.resources[resCollection];
    }

    public getGameTile(resCollection: ResourceCollections, id: number): GameTile {
        return this.resources[resCollection].gameTiles[id];
    }

    public addDebugGUI() {
        const debugContainer = document.createElement("div");
        const canvasContainer = document.createElement("div");

        // Create DropDown with the different resource collections
        const resourceSelect = document.createElement("select");
        for (let file of this.files) {
            const option = document.createElement("option");
            option.value = file;
            option.text = file;
            resourceSelect.add(option);
        }
        debugContainer.appendChild(resourceSelect);
        debugContainer.appendChild(canvasContainer);

        document.body.appendChild(debugContainer);

        // Add listener for DropDown
        resourceSelect.addEventListener("change", (event) => {

            // remove old canvas
            while (canvasContainer.firstChild) {
                canvasContainer.removeChild(canvasContainer.firstChild);
            }

            canvasContainer.appendChild(this.createDebugTileCanvas(this.resources[resourceSelect.value]));

        }, false);

    }

    private createDebugTileCanvas(resource: GM1Resource): HTMLCanvasElement {
        // create off-screen canvas element
        const canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d');
        canvas.width = 1400;
        canvas.height = 3000;


        let lastCanvasX = 0;
        let lastCanvasY = 20;
        let maxCanvasHeight = 0;
        let d = 0;
        for (const gameTiles of resource.gameTiles) {

            //bounding box
            let top = Infinity;
            let left = Infinity;
            let bottom = 0;
            let right = 0;

            for (const tile of gameTiles.tiles) {
                //find bounds of the sub-images
                const x = tile.header.PositionX;
                const y = tile.header.PositionY;
                const w = tile.header.Width;
                const h = tile.header.Height;

                left = Math.min(left, x);
                top = Math.min(top, y);
                right = Math.max(right, x + w);
                bottom = Math.max(bottom, y + h);
            }
            //calculate the actual dimensions of the image
            const width = right - left;
            const height = bottom - top;

            ctx.rect(lastCanvasX - 5, lastCanvasY - 5, width + 5, height + 5);
            ctx.stroke();
            ctx.fillText(d++ + "", lastCanvasX, lastCanvasY - 7);


            for (const tile of gameTiles.tiles) {
                // draw the tile part
                let x = tile.header.PositionX - left;
                let y = tile.header.PositionY + tile.header.TilePositionY - top;
                CanvasUtil.putImageWithTransparency(ctx, new ImageData(tile.tile, 30, 16), x + lastCanvasX, y + lastCanvasY);

                //draw the image part
                x = tile.header.PositionX + tile.header.HorizontalOffset - left;
                y = tile.header.PositionY - top;
                CanvasUtil.putImageWithTransparency(ctx, new ImageData(tile.image, tile.header.Width, tile.header.Height), x + lastCanvasX, y + lastCanvasY);
            }

            lastCanvasX += width + 20;
            maxCanvasHeight = Math.max(maxCanvasHeight, height);
            if (lastCanvasX > 1000) {
                lastCanvasX = 10;
                lastCanvasY += maxCanvasHeight + 20;
                maxCanvasHeight = 0;
            }
        }

        return canvas;
    }

}