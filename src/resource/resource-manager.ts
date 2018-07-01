import {Observable} from "rxjs/internal/Observable";
import {forkJoin} from "rxjs/internal/observable/forkJoin";
import {GameTile, Gm1Loader, GM1Resource} from "./gm1-loader";
import {IHash} from "../util/hash-maps";
import {CanvasUtil} from "../util/canvas-util";
import {TGXLoader, TGXResource} from "./tgx-loader";

export enum ResourceCollections {
    BUILDINGS_CASTLES = "gm/tile_castle.gm1",
    TERRAIN_GRASSLANDS = "gm/tile_land_macros.gm1",
    TERRAIN_DATA = "gm/tile_data.gm1",
    TERRAIN_STONELANDS = "gm/tile_land8.gm1",
    BUILDINGS_STOCKPILES = "gm/tile_goods.gm1",
    SCRIBE = "gm/scribe.gm1",
    INTERFACE_BUTTONS = "gm/interface_buttons.gm1",
    INTERFACE_ARMY = "gm/interface_army.gm1",
    INTERFACE_ICONS2 = "gm/interface_icons2.gm1",
    INTERFACE_ICONS3 = "gm/interface_icons3.gm1",
    INTERFACE_RUINS = "gm/interface_ruins.gm1",
    INTERFACE_SLIDER_BAR = "gm/interface_slider_bar.gm1",
    INTERFACE_ICONS_FRONT_END = "gm/icons_front_end.gm1",
    INTERFACE_ICONS_PLACEHOLDERS = "gm/icons_placeholders.gm1",
    INTERFACE_ICONS_FRONT_END_BUILDER = "gm/icons_front_end_builder.gm1",
    INTERFACE_ICONS_FRONT_END_COMBAT = "gm/icons_front_end_combat.gm1",
    INTERFACE_ICONS_FRONT_END_ECONOMICS = "gm/icons_front_end_economics.gm1",
    INTERFACE_MAP_EDIT = "gm/mapedit_buttons.gm1",
    INTERFACE_CURSORS_FLOATS = "gm/floats.gm1",
    INTERFACE_CRACKS = "gm/cracks.gm1",
    FONT_STRONGHOLD = "gm/font_stronghold.gm1",
    INTERFACE_FRONTEND_MAIN = "gfx/frontend_main.tgx",
    INTERFACE_FRONTEND_MAIN2 = "gfx/frontend_main2.tgx",
    INTERFACE_FRONTEND_BUILDER = "gfx/frontend_builder.tgx",
    INTERFACE_FRONTEND_COMBAT = "gfx/frontend_combat.tgx",
    INTERFACE_TSLICE1 = "gfx/tslice1.tgx",
    INTERFACE_TEST = "gm/face800-blank.gm1",
}


export class ResourceManager {
    private files: string[] = [];
    private gm1Resources: IHash<GM1Resource> = {};
    private tgxResources: IHash<TGXResource> = {};

    constructor() {
        this._gm1Loader = new Gm1Loader();
        this._tgxLoader = new TGXLoader();
        for (let res in ResourceCollections) {
            this.files.push(ResourceCollections[res]);
        }
    }

    private _gm1Loader: Gm1Loader;

    get gm1Loader(): Gm1Loader {
        return this._gm1Loader;
    }

    private _tgxLoader: TGXLoader;

    get tgxLoader(): TGXLoader {
        return this._tgxLoader;
    }

    private static createTGXDebugElement(resource: TGXResource): HTMLElement {

        const canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d');
        canvas.width = resource.width;
        canvas.height = resource.height;

        CanvasUtil.putImageWithTransparency(ctx, new ImageData(resource.image, resource.width, resource.height), 0, 0);
        return canvas;

    }

    private static createGM1DebugElement(resource: GM1Resource): HTMLElement {
        // create off-screen canvas element
        const canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d');
        canvas.width = 1400;
        canvas.height = 6000;


        let lastCanvasX = 0;
        let lastCanvasY = 20;
        let maxHeightInRow = 0;
        let d = 0;
        // Draw tiles in resource
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

            ctx.strokeStyle = "green";
            ctx.strokeRect(lastCanvasX - 5, lastCanvasY - 5, width + 5, height + 5);
            ctx.stroke();
            ctx.fillText(d++ + " " + width + " x " + height, lastCanvasX, lastCanvasY - 7);


            console.log(gameTiles);
            try {
                for (const tile of gameTiles.tiles) {

                    // draw the tile part
                    let x = tile.header.PositionX - left;
                    let y = tile.header.PositionY + tile.header.TilePositionY - top;
                    if (tile.tile) {
                        CanvasUtil.putImageWithTransparency(ctx, new ImageData(tile.tile, 30, 16), x + lastCanvasX, y + lastCanvasY);
                    } else {
                        ctx.fillText("Skipped tile", lastCanvasX, lastCanvasY + 10);
                    }
                    //draw the image part
                    x = tile.header.PositionX + tile.header.HorizontalOffset - left;
                    y = tile.header.PositionY - top;
                    if (tile.image) {
                        CanvasUtil.putImageWithTransparency(ctx, new ImageData(tile.image, tile.header.Width, tile.header.Height), x + lastCanvasX, y + lastCanvasY);
                    } else {
                        ctx.fillText("Skipped image", lastCanvasX, lastCanvasY + 20);
                    }
                }
            } catch (e) {
                console.warn("Error while rendering tile", e);
            }

            lastCanvasX += width + 20;
            maxHeightInRow = Math.max(maxHeightInRow, height);
            if (lastCanvasX > 1000) {
                lastCanvasX = 10;
                lastCanvasY += maxHeightInRow + 20;
                maxHeightInRow = 0;
            }
        }

        lastCanvasX = 0;
        let i = 0;

        // Draw images in resource
        for (let image of resource.images) {

            ctx.fillText("ID: " + i++, lastCanvasX, lastCanvasY);
            ctx.fillText("W: " + image.header.Width + " H: " + image.header.Height, lastCanvasX, lastCanvasY + 10);
            ctx.fillText("X: " + image.header.PositionX + " Y: " + image.header.PositionY, lastCanvasX, lastCanvasY + 20);
            CanvasUtil.putImageWithTransparency(ctx, new ImageData(image.image, image.header.Width, image.header.Height), lastCanvasX, lastCanvasY + 30);
            lastCanvasX += image.header.Width + 20;

            maxHeightInRow = Math.max(maxHeightInRow, image.header.Height + 30);
            if (lastCanvasX > 1000) {
                lastCanvasX = 10;
                lastCanvasY += maxHeightInRow + 20;
                maxHeightInRow = 0;
            }
        }

        return canvas;
    }

    public loadResources(): Observable<void> {
        return new Observable<void>(subscriber => {
            forkJoin(this.files.map(path => {
                if (path.split('.')[1] == 'gm1') {
                    return this._gm1Loader.loadImage(path);
                } else {
                    return this._tgxLoader.loadImage(path);
                }

            })).subscribe((data: any[]) => {
                for (let res of data) {
                    if (res['path'].split('.')[1] == "gm1") {
                        this.gm1Resources[res.path] = res;
                    } else if (res['path'].split('.')[1] == "tgx") {
                        this.tgxResources[res.path] = res;
                    } else {
                        console.error("Unknown resource type");
                    }
                }
                subscriber.next();
                subscriber.complete();
            });
        });
    }

    public getGM1Resources(resCollection: ResourceCollections): GM1Resource {
        return this.gm1Resources[resCollection];
    }

    public getGameTile(resCollection: ResourceCollections, id: number): GameTile {
        return this.gm1Resources[resCollection].gameTiles[id];
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

            if (this.gm1Resources[resourceSelect.value]) {
                canvasContainer.appendChild(ResourceManager.createGM1DebugElement(this.gm1Resources[resourceSelect.value]));
            } else if (this.tgxResources[resourceSelect.value]) {
                canvasContainer.appendChild(ResourceManager.createTGXDebugElement(this.tgxResources[resourceSelect.value]));
            } else {
                console.error("Unknown resource");
            }

        }, false);

    }

}