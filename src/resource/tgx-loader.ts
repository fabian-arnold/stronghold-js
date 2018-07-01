import {BaseLoader} from "./base-loader";
import {Gm1Loader} from "./gm1-loader";

export class TGXResource {
    public path: string;
    public height: number;
    public width: number;
    public image: Uint8ClampedArray;
}

export class TGXLoader extends BaseLoader<TGXResource> {

    protected parse(arrayBuffer: ArrayBufferLike, url: string): TGXResource {

        const resource = new TGXResource();
        const headerView = new DataView(arrayBuffer, 0, 8);
        resource.width = headerView.getUint16(0, true);
        resource.height = headerView.getUint16(4, true);

        const imageView = new DataView(arrayBuffer, 8);
        const imgBuffer = new Uint8ClampedArray(resource.width * resource.height * 4);
        Gm1Loader.decodeTGX(imageView, resource.width, imgBuffer);
        resource.image = imgBuffer;
        resource.path = url;
        return resource;

    }
}