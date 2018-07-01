import {GameObject} from "./gameObject";

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

    constructor() {
        super();
        this.keyMapping[InputSequence.LEFT] = new KeySequence("a".charCodeAt(0));
        this.keyMapping[InputSequence.UP] = new KeySequence("w".charCodeAt(0));
        this.keyMapping[InputSequence.RIGHT] = new KeySequence("d".charCodeAt(0));
        this.keyMapping[InputSequence.DOWN] = new KeySequence("s".charCodeAt(0));

    }

    public register() {
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
    }

    public isDown(key: InputSequence) {
        const seq = this.keyMapping[key];
        return this.keyStates[seq.keyCode] == InputStateInternal.DOWN || this.keyStates[seq.keyCode] == InputStateInternal.TO_RELEASE;
    }

    public isUp(key: InputSequence) {
        return !this.isDown(key);
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