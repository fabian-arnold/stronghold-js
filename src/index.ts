import {Engine} from "./engine/engine";
import {Gm1Loader} from "./resource/gm1-loader";
import {ResourceCollections, ResourceManager} from "./resource/resource-manager";


const imageLoader: Gm1Loader = new Gm1Loader();

const resourceManager = new ResourceManager();
const engine: Engine = new Engine(resourceManager);

/*
    tile_goods.gm1: stock piles
    tile_land8:     stone lands
 */


resourceManager.loadResources().subscribe(_ => {
    resourceManager.addDebugGUI();

    engine.addTile(resourceManager.getGameTile(ResourceCollections.TERRAIN_GRASSLANDS, 0).tiles);
    engine.addTile(resourceManager.getGameTile(ResourceCollections.TERRAIN_STONELANDS, 0).tiles);
    engine.addTile(resourceManager.getGameTile(ResourceCollections.TERRAIN_STONELANDS, 1).tiles);
    //engine.addTile(resourceManager.getGameTile(ResourceCollections.BUILDINGS_CASTLES, 7).tiles);

    engine.init();

    engine.start();
});

