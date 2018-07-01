import {GameObject} from "../engine/gameObject";
import {Engine} from "../engine/engine";

export class Gui extends GameObject {

    private leftEdge: HTMLImageElement;
    private rightEdge: HTMLImageElement;

    init(engine: Engine) {
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
        // this.buildingContainer =
    }

    private imagedata_to_url(imagedata: ImageData) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = imagedata.width;
        canvas.height = imagedata.height;
        ctx.putImageData(imagedata, 0, 0);

        return canvas.toDataURL();
    }


}