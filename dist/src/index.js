"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var engine_1 = require("./engine/engine");
var gm1_loader_1 = require("./resource/gm1-loader");
var resource_manager_1 = require("./resource/resource-manager");
var imageLoader = new gm1_loader_1.Gm1Loader();
var resourceManager = new resource_manager_1.ResourceManager();
var engine = new engine_1.Engine(resourceManager);
/*
    tile_goods.gm1: stock piles
    tile_land8:     stone lands
 */
resourceManager.loadResources().subscribe(function (_) {
    resourceManager.addDebugGUI();
    engine.addTile(resourceManager.getGameTile(resource_manager_1.ResourceCollections.TERRAIN_GRASSLANDS, 0).tiles);
    engine.addTile(resourceManager.getGameTile(resource_manager_1.ResourceCollections.TERRAIN_STONELANDS, 0).tiles);
    engine.addTile(resourceManager.getGameTile(resource_manager_1.ResourceCollections.TERRAIN_STONELANDS, 1).tiles);
    //engine.addTile(resourceManager.getGameTile(ResourceCollections.BUILDINGS_CASTLES, 7).tiles);
    engine.init();
    engine.start();
});
//# sourceMappingURL=index.js.map