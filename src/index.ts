import {strongholdjs} from "./engine/engine";
import {ImageLoader} from "./resource/image-loader";
import Engine = strongholdjs.Engine;

const imageLoader: ImageLoader = new ImageLoader();
const engine: Engine = new Engine();

imageLoader.loadImage("gm/tile_land8.gm1").subscribe(value => {
    engine.addTile(value[0]);
    engine.addTile(value[1]);
    engine.addTile(value[2]);
    engine.addTile(value[3]);
    engine.start();
});

