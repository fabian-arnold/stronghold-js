import {GameObject} from "./gameObject";
import {ChunkPos, Engine, Point} from "./engine";

export enum InputState {
    PRESSED,
    RELEASED,

}

export enum InputSequence {
    LEFT,
    RIGHT,
    UP,
    DOWN,

}

export class KeySequence {

    public keyCode: number;
    public isAlt: boolean;
    public isCtrl: boolean;

    constructor(keyCode: number, isAlt: boolean = false, isCtrl: boolean = false) {
        this.keyCode = keyCode;
        this.isAlt = isAlt;
        this.isCtrl = isCtrl;

    }
}


enum InputStateInternal {
    DOWN,
    TO_RELEASE,
    RELEASED
}

export class Input extends GameObject {


    private keyStates: InputStateInternal[] = [];

    private keyMapping: KeySequence[] = [];

    private mouseX = 0;
    private mouseY = 0;

    private mouseDown = false;

    private engine: Engine;

    constructor() {
        super();
        this.keyMapping[InputSequence.LEFT] = new KeySequence("a".charCodeAt(0));
        this.keyMapping[InputSequence.UP] = new KeySequence("w".charCodeAt(0));
        this.keyMapping[InputSequence.RIGHT] = new KeySequence("d".charCodeAt(0));
        this.keyMapping[InputSequence.DOWN] = new KeySequence("s".charCodeAt(0));

    }

    init(engine: Engine): void {
        this.engine = engine;
    }

    public register(gameContainer: HTMLElement) {
        window.addEventListener("keydown", (event: KeyboardEvent) => {
            if (!event.repeat) {
                console.log("Down", event);
                this.keyStates[event.key.charCodeAt(0)] = InputStateInternal.DOWN;
            }
        }, true);
        window.addEventListener("keyup", (event: KeyboardEvent) => {
            console.log("Up", event);
            this.keyStates[event.key.charCodeAt(0)] = InputStateInternal.TO_RELEASE;
        }, true);

        gameContainer.addEventListener("mousemove", (event) => {
            const rect = gameContainer.getBoundingClientRect();
            this.mouseX = event.clientX - rect.left;
            this.mouseY = event.clientY - rect.top;

        });

        gameContainer.addEventListener("mousedown", (event) => {
            this.mouseDown = true;
        });
        gameContainer.addEventListener("mouseup", (event) => {
            this.mouseDown = false;
        });
    }

    public isDown(key: InputSequence) {
        const seq = this.keyMapping[key];
        return this.keyStates[seq.keyCode] == InputStateInternal.DOWN || this.keyStates[seq.keyCode] == InputStateInternal.TO_RELEASE;
    }

    public isUp(key: InputSequence) {
        return !this.isDown(key);
    }

    public getMouseScreenPos(): Point {
        return {x: this.mouseX, y: this.mouseY};
    }

    public getMouseWorldPos(): Point {
        return {
            x: this.mouseX + this.engine.camera.getPos().x,
            y: this.mouseY + this.engine.camera.getPos().y
        };
    }

    public isMouseDown(): boolean {
        return this.mouseDown;
    }

    public getMouseChunkPos(): ChunkPos {
        const pos = this.getMouseWorldPos();
        return Engine.chunkForPixel(pos.x, pos.y);
    }

    public update() {

        // Delay releasing the keys so there are down at least one cycle
        for (let key in this.keyStates) {
            if (this.keyStates[key] == InputStateInternal.TO_RELEASE) {
                this.keyStates[key] = InputStateInternal.RELEASED;
            }
        }

    }


}