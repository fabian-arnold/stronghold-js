import {Point} from "./engine";

export class Camera {
    private _x: number;

    get x(): number {
        return this._x;
    }

    set x(value: number) {
        this._x = value;
    }

    private _y: number;

    get y(): number {
        return this._y;
    }

    set y(value: number) {
        this._y = value;
    }

    public setPos(x: number, y: number) {
        this._x = x;
        this._y = y;
    }

    public getPos(): Point {
        return {
            x: this._x,
            y: this._y
        }
    }

}