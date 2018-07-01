import {Engine} from "./engine/engine";
import {ImageLoader} from "./resource/image-loader";
import {ResourceCollections, ResourceManager} from "./resource/resource-manager";


const imageLoader: ImageLoader = new ImageLoader();
const engine: Engine = new Engine();

/*
    tile_goods.gm1: stock piles
    tile_land8:     stone lands
 */


const resourceManager = new ResourceManager();
resourceManager.loadResources().subscribe(_ => {
    resourceManager.addDebugGUI();

    engine.addTile(resourceManager.getGameTile(ResourceCollections.TERRAIN_GRASSLANDS, 0).tiles);
    engine.addTile(resourceManager.getGameTile(ResourceCollections.TERRAIN_STONELANDS, 0).tiles);
    engine.addTile(resourceManager.getGameTile(ResourceCollections.TERRAIN_STONELANDS, 1).tiles);
    //engine.addTile(resourceManager.getGameTile(ResourceCollections.BUILDINGS_CASTLES, 7).tiles);

    engine.init();

    engine.start();
});

