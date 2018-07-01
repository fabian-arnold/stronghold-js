import {CanvasUtil} from "../util/canvas-util";
import {ChunkPos} from "./engine";
import {Terrain} from "./terrain/terrain";
import {GM1Tile} from "../resource/gm1-loader";

export class Building {

    // FIXME unify with the canvas draw version
    public static drawTile(ctx: CanvasRenderingContext2D, tiles: GM1Tile[], i: number, j: number) {
        const refTile = tiles[0];

        const _x = refTile.header.PositionX;
        const _y = refTile.header.PositionY;


        for (let tile of tiles) {
            const isoPos = Terrain.pointToCoord(new ChunkPos(i, j));
            isoPos.x += tile.header.PositionX - _x;
            isoPos.y += tile.header.PositionY + tile.header.TilePositionY - _y;


            //isoPos.y += tile.header.TilePositionY;
            CanvasUtil.putImageWithTransparency(ctx, new ImageData(tile.tile, 30, 16), isoPos.x, isoPos.y);
        }
    }

    public static drawImage(ctx: CanvasRenderingContext2D, tiles: GM1Tile[], i: number, j: number) {
        const refTile = tiles[0];

        const _x = refTile.header.PositionX;
        const _y = refTile.header.PositionY;

        for (let tile of tiles) {
            const isoPos = Terrain.pointToCoord(new ChunkPos(i, j));
            isoPos.x += tile.header.PositionX + tile.header.HorizontalOffset - _x;
            isoPos.y += tile.header.PositionY - _y;

            CanvasUtil.putImageWithTransparency(ctx, new ImageData(tile.image, tile.header.Width, tile.header.Height), isoPos.x, isoPos.y);
        }
    }
}