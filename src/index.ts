import {strongholdjs} from "./engine/engine";
import {GameTile, ImageLoader} from "./resource/image-loader";
import {forkJoin} from 'rxjs';
import Engine = strongholdjs.Engine;

const imageLoader: ImageLoader = new ImageLoader();
const engine: Engine = new Engine();

/*
    tile_goods.gm1: stock piles
    tile_land8:     stone lands
 */
forkJoin(imageLoader.loadImage("gm/tile_castle.gm1"),
    imageLoader.loadImage("gm/tile_land_macros.gm1")).subscribe(val => {
    const value: GameTile[][] = <any>val;
    engine.addTile(value[1][0].tiles);
    engine.addTile(value[0][3].tiles);
    console.log(value[0][0].tiles);
  //  console.log(value[1][0].tiles);
    // engine.addTile(value[1][48]);
    // engine.addTile(value[1][96]);
    // engine.addTile(value[0][3]);
    engine.start();
});

