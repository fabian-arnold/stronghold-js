import {GameObject} from "../engine/gameObject";
import {Engine} from "../engine/engine";
import {ResourceCollections} from "../resource/resource-manager";
import {Building} from "../engine/building";

export class Gui extends GameObject {

    private leftEdge: HTMLImageElement;
    private rightEdge: HTMLImageElement;
    private engine: Engine;
    private menuContainer: HTMLDivElement;

    init(engine: Engine) {
        this.engine = engine;
        const width = engine.gameWidth;
        engine.resourceManager.tgxLoader.loadImage("gfx/edge" + width + "l.tgx").subscribe(value => {
            this.leftEdge = document.createElement("img");
            this.leftEdge.style.position = "absolute";
            this.leftEdge.style.left = "0";
            this.leftEdge.style.bottom = "0";
            this.leftEdge.style.width = value.width + "px";
            this.leftEdge.style.height = value.height + "px";

            this.leftEdge.src = this.imagedata_to_url(new ImageData(value.image, value.width, value.height));

            engine.gameContainer.appendChild(this.leftEdge);

        });
        engine.resourceManager.tgxLoader.loadImage("gfx/edge" + width + "r.tgx").subscribe(value => {
            this.rightEdge = document.createElement("img");
            this.rightEdge.style.position = "absolute";
            this.rightEdge.style.right = "0";
            this.rightEdge.style.bottom = "0";
            this.rightEdge.style.width = value.width + "px";
            this.rightEdge.style.height = value.height + "px";

            this.rightEdge.src = this.imagedata_to_url(new ImageData(value.image, value.width, value.height));

            engine.gameContainer.appendChild(this.rightEdge);
        });

        engine.resourceManager.gm1Loader.loadImage("gm/face800-blank.gm1").subscribe(value => {
            this.menuContainer = document.createElement("div");

            this.menuContainer.style.position = "absolute";
            this.menuContainer.style.left = "50%";
            this.menuContainer.style.bottom = "0";
            this.menuContainer.style.width = value.images[0].header.Width + "px";
            this.menuContainer.style.height = value.images[0].header.Height + "px";
            this.menuContainer.style.marginLeft = "-" + (value.images[0].header.Width / 2) + "px";

            this.menuContainer.style.background = "url(" + this.imagedata_to_url(new ImageData(value.images[0].image, value.images[0].header.Width, value.images[0].header.Height)) + ")";
            console.log(this.imagedata_to_url(new ImageData(value.images[0].image, value.images[0].header.Width, value.images[0].header.Height)));
            engine.gameContainer.appendChild(this.menuContainer);

            this.createButton(7, 20, 0, this.menuContainer);
            this.createButton(10, 20 + 37, 0, this.menuContainer);
            this.createButton(13, 20 + 37 * 2, 0, this.menuContainer);
            this.createButton(16, 20 + 37 * 3, 0, this.menuContainer);
            this.createButton(19, 20 + 37 * 4, 0, this.menuContainer);
            this.createButton(22, 20 + 37 * 5, 0, this.menuContainer);

            const placeholders = this.engine.resourceManager.getGM1Resources(ResourceCollections.INTERFACE_ICONS_PLACEHOLDERS);
            for (let pl of placeholders.images) {

            }

            this.createBuildButton(18, 25, 45, this.menuContainer);
            this.createBuildButton(14, 60, 45, this.menuContainer);
            this.createBuildButton(16, 120, 40, this.menuContainer);
            this.createBuildButton(12, 190, 35, this.menuContainer);

            //this.createButton(engine.resourceManager.getGM1Resources(ResourceCollections.INTERFACE_BUTTONS).images[103], 0, 0, this.menuContainer);
            //this.createButton(engine.resourceManager.getGM1Resources(ResourceCollections.INTERFACE_BUTTONS).images[106], 0, 0, this.menuContainer);
            //this.createButton(engine.resourceManager.getGM1Resources(ResourceCollections.INTERFACE_BUTTONS).images[109], 0, 0, this.menuContainer);

        });
        // this.buildingContainer =
    }

    render(ctx: CanvasRenderingContext2D) {

        const cord = this.engine.input.getMouseChunkPos();

        const castle = this.engine.resourceManager.getGM1Resources(ResourceCollections.BUILDINGS_CASTLES).gameTiles[3];
        Building.drawTile(ctx, castle.tiles, cord.i, cord.j);
        Building.drawImage(ctx, castle.tiles, cord.i, cord.j);

    }

    update() {
        if (this.engine.input.isMouseDown()) {
            const cord = this.engine.input.getMouseChunkPos();
            const nextTileId = (this.engine.terrain.getTileId(cord.i, cord.j) + 1) % 3;
            // //     const nextTileCount = this.tiles[nextTileId].length;
            //
            this.engine.terrain.setTileId(cord.i, cord.j, nextTileId);
        }

    }

    private createBuildButton(imageNr: number, x: number, y: number, container: HTMLElement) {
        const image = this.engine.resourceManager.getGM1Resources(ResourceCollections.INTERFACE_ICONS_PLACEHOLDERS).images[imageNr];
        const hoverImage = this.engine.resourceManager.getGM1Resources(ResourceCollections.INTERFACE_ICONS_PLACEHOLDERS).images[imageNr + 1];


        const imageSrc = this.imagedata_to_url(new ImageData(image.image, image.header.Width, image.header.Height));
        const hoverImageSrc = this.imagedata_to_url(new ImageData(hoverImage.image, hoverImage.header.Width, hoverImage.header.Height));

        const button = document.createElement("img");

        button.style.position = "absolute";
        button.style.left = x + "px";
        button.style.bottom = y + "px";
        button.height = image.header.Height;
        button.width = image.header.Width;
        button.src = imageSrc;

        button.onmouseenter = () => {
            button.src = hoverImageSrc;
        };

        button.onmouseleave = () => {
            button.src = imageSrc;
        };


        this.menuContainer.appendChild(button);

    }

    private createButton(imageNr: number, x: number, y: number, container: HTMLElement) {

        const image = this.engine.resourceManager.getGM1Resources(ResourceCollections.INTERFACE_BUTTONS).images[imageNr];
        const hoverImage = this.engine.resourceManager.getGM1Resources(ResourceCollections.INTERFACE_BUTTONS).images[imageNr + 1];
        const clickImage = this.engine.resourceManager.getGM1Resources(ResourceCollections.INTERFACE_BUTTONS).images[imageNr + 2];

        const imageSrc = this.imagedata_to_url(new ImageData(image.image, image.header.Width, image.header.Height));
        const hoverImageSrc = this.imagedata_to_url(new ImageData(hoverImage.image, hoverImage.header.Width, hoverImage.header.Height));
        const clickImageSrc = this.imagedata_to_url(new ImageData(clickImage.image, clickImage.header.Width, clickImage.header.Height));
        const button = document.createElement("img");


        console.log(image.header);
        button.style.position = "absolute";
        button.style.left = x + "px";
        button.style.bottom = y + "px";
        button.height = image.header.Height;
        button.width = image.header.Width;
        button.src = imageSrc;

        button.onmouseenter = () => {
            button.src = hoverImageSrc;
        };

        button.onmouseleave = () => {
            button.src = imageSrc;
        };

        button.onmousedown = () => {
            button.src = clickImageSrc;
        };
        button.onmouseup = () => {
            button.src = hoverImageSrc;
        };


        container.appendChild(button);
    }

    private imagedata_to_url(imagedata: ImageData) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = imagedata.width;
        canvas.height = imagedata.height;
        ctx.putImageData(imagedata, 0, 0);
        return canvas.toDataURL();
    }

    private image_to_background(imagedata: ImageData, ele: HTMLElement) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = imagedata.width;
        canvas.height = imagedata.height;
        ctx.putImageData(imagedata, 0, 0);

        canvas.toBlob(blob => {
            ele.style.backgroundImage = URL.createObjectURL(blob);
        })
    }
}