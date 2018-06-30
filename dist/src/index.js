"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var engine_1 = require("./engine/engine");
var image_loader_1 = require("./resource/image-loader");
var resource_manager_1 = require("./resource/resource-manager");
var imageLoader = new image_loader_1.ImageLoader();
var engine = new engine_1.Engine();
/*
    tile_goods.gm1: stock piles
    tile_land8:     stone lands
 */
var resourceManager = new resource_manager_1.ResourceManager();
resourceManager.loadResources().subscribe(function (_) {
    resourceManager.addDebugGUI();
    engine.addTile(resourceManager.getGameTile(resource_manager_1.ResourceCollections.STONELANDS, 0).tiles);
    engine.addTile(resourceManager.getGameTile(resource_manager_1.ResourceCollections.STONELANDS, 1).tiles);
    engine.addTile(resourceManager.getGameTile(resource_manager_1.ResourceCollections.STONELANDS, 2).tiles);
    engine.start();
});
//# sourceMappingURL=index.js.map