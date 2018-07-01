import {Observable} from "rxjs/index";

export class BaseLoader<T> {


    loadImage(url: string): Observable<T> {
        const oReq = new XMLHttpRequest();
        oReq.open("GET", url, true);
        // oReq.open("GET", "gm/tile_goods.gm1", true);
        oReq.responseType = "arraybuffer";

        console.log("Loading image...");
        return new Observable<T>(subscriber => {
            oReq.onload = oEvent => {
                subscriber.next(this.parse(<any>oReq.response, url));
                subscriber.complete();
            };


            oReq.send(null);
        });
    }

    protected parse(arrayBuffer: ArrayBufferLike, url: string): T {
        throw Error("not implemented parser");
    }
}