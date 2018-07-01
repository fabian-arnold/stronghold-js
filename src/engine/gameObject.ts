import {Engine} from "./engine";

export class GameObject {

    // Render Lifecycles
    preRender(): void {

    }

    render(ctx: CanvasRenderingContext2D): void {

    }

    postRender(): void {

    }


    // Update Lifecycles
    preUpdate(): void {

    }

    update(): void {

    }

    postUpdate(): void {

    }

    // Init Lifecycles
    preInit(): void {
    }

    init(engine: Engine): void {

    }

    postInit(): void {
    }


}