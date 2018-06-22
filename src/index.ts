import {GameTile, ImageLoader} from "./resource/image-loader";
import THREE = require("three");

let camera: THREE.OrthographicCamera;
let scene: THREE.Scene;
let renderer: THREE.Renderer;


let mesh: THREE.Mesh;
let mesh2: THREE.Mesh;
init();
animate();

window.onresize = function () {
    // notify the renderer of the size change
    renderer.setSize(window.innerWidth, window.innerHeight);
    // update the camera
    camera.right = window.innerWidth;
    camera.top = window.innerHeight;
    camera.updateProjectionMatrix();
};

// movement - please calibrate these values
var xSpeed = 10;
var ySpeed = 10;

document.addEventListener("keydown", onDocumentKeyDown, false);

function onDocumentKeyDown(event: KeyboardEvent) {
    var keyCode = event.which;
    console.log("KeyCode", keyCode);
    if (keyCode == 87) {
        camera.position.y += ySpeed;
    } else if (keyCode == 83) {
        camera.position.y -= ySpeed;
    } else if (keyCode == 65) {
        camera.position.x -= xSpeed;
    } else if (keyCode == 68) {
        camera.position.x += xSpeed;
    } else if (keyCode == 32) {
        camera.position.set(0, 0, 0);
    }
    camera.updateProjectionMatrix();
};

function init() {

    camera = new THREE.OrthographicCamera(-100, 100, 100, -100, -100, 100);
    camera.left = 0;
    camera.right = window.innerWidth ;
    camera.top = window.innerHeight;
    camera.bottom = 0;
    camera.updateProjectionMatrix();

//    camera.position.z = 1;

    scene = new THREE.Scene();


    const imageLoader: ImageLoader = new ImageLoader();
    imageLoader.loadImage("gm/tile_castle.gm1").subscribe(value => {
        buildingTiles = value;
        let geometry: THREE.Geometry;
        let material: THREE.Material;
        geometry = new THREE.PlaneGeometry(value[0].imageData.width, value[0].imageData.height);

        let texture = new THREE.Texture(<any>value[0].imageData);
        material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
        });
        texture.needsUpdate = true;
        mesh2 = new THREE.Mesh(geometry, material);
        scene.add(mesh2);
        window.onmousemove = function (event) {

            let x = (event.x - camera.position.x) / tileSizeX;
            let y = (event.y - camera.position.y) / tileSizeX;
            x *= tileSizeX;
            x += (y % 2) * (tileSizeX / 2);
            y *= tileSizeY;
            mesh2.position.x = x;
            mesh2.position.y = y;
            mesh2.position.z = 10;
        }
    });
    imageLoader.loadImage("gm/tile_land8.gm1").subscribe(value => {
        terrainTiles = value;
        let geometry: THREE.Geometry;
        let material: THREE.Material;
        geometry = new THREE.PlaneGeometry(20, 20);

        let texture = new THREE.Texture(<any>value[0].imageData);
        texture.needsUpdate = true;
        material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
        });
        //material = new THREE.MeshNormalMaterial();

        var geom = new THREE.Geometry();

        for (let y = 0; y < 160; y++) {
            for (let x = 0; x < 160; x++) {
                const offsetX = (y % 2) * (tileSizeX / 2);
                geom.vertices.push(new THREE.Vector3(x * tileSizeX + offsetX, y * tileSizeY))


            }
        }

        for (let y = 0; y < 158; y++) {
            for (let x = 0; x < 159; x++) {
                geom.faces.push(new THREE.Face3(x + y * 160, x + 1 + y * 160, x + 320 + y * 160));
                geom.faceVertexUvs[0].push([new THREE.Vector2(0, 0,), new THREE.Vector2(1, 0), new THREE.Vector2(0, 1)]);
                geom.faces.push(new THREE.Face3(x + 1 + y * 160, x + 321 + y * 160, x + 320 + y * 160));
                geom.faceVertexUvs[0].push([new THREE.Vector2(1, 0,), new THREE.Vector2(1, 1), new THREE.Vector2(0, 1)]);
            }
        }
        geom.uvsNeedUpdate = true;
        geom.verticesNeedUpdate = true;

        geom.computeFaceNormals();


        // material = new THREE.MeshNormalMaterial();
        mesh = new THREE.Mesh(geom, material);
        scene.add(mesh);

    });


    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

}

function animate() {

    requestAnimationFrame(animate);

    //  mesh.rotation.x += 0.01;
    //  mesh.rotation.y += 0.02;

    renderer.render(scene, camera);

}

const tileSizeX = 26;
const tileSizeY = 12;

let terrainTiles: GameTile[];
let buildingTiles: GameTile[];
const canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d');

function getMousePos(canvas: HTMLCanvasElement, evt: MouseEvent) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

// Two Dimensional Array storing our isometric map layout. Each number represents a tile.
var map = [
    [1,0,0,0],
    [1,0,0,1],
    [0,0,1,1],
    [1,1,1,1]
];

var tileGraphics = [];

function init() {
// load grpphics then draw map

    // Tutorial Note: As water is loaded first it will be represented by a 0 on the map and land will be a 1.
    var tileGraphicsToLoad = [
        "/tutorials/images/water.png",
        "/tutorials/images/land.png"
    ];

    tileGraphicsLoaded = 0;

    for (var i = 0; i < tileGraphicsToLoad.length; i++) {
        tileGraphics[i] = new Image();
        tileGraphics[i].src = tileGraphicsToLoad[i];
        tileGraphics[i].onload = function() {
            // Once image is loaded increment the loaded graphics count and check if all images are ready.
            tileGraphicsLoaded++;
            if (tileGraphicsLoaded === tileGraphicsToLoad.length) {
                // Draw the map when all images loaded
                drawMap();
            }
        }
    }

}


function drawMap() {

    // create the canvas context
    var ctx = document.getElementById('main').getContext('2d');

    // Set as your tile pixel sizes, alter if you are using larger tiles.
    var tileH = 25;
    var tileW = 52;

    // mapX and mapY are offsets to make sure we can position the map as we want.
    var mapX = 76;
    var mapY = 52;

    var drawTile;

    ctx.clearRect(0, 0, 208, 158);

    // loop through our map and draw out the image represented by the number.
    for (var i = 0; i < map.length; i++) {
        for (var j = 0; j < map[i].length; j++) {
            drawTile = map[i][j];
            // Draw the represented image number, at the desired X & Y coordinates followed by the graphic width and height.
            ctx.drawImage(tileGraphics[drawTile], (i - j) * tileH + mapX, (i + j) * tileH / 2 + mapY);
        }
    }
}

function allowRotate() {
    // Display the rotate button once images have loaded and map is drawn
    var rot = document.createElement("div")
    rot.innerHTML = "[Click Here To Rotate]";
    rot.style.textDecoration = "underline"

    // On click rotate map and redraw
    rot.addEventListener("click", function(e) {
        var maproteun = [];
        var size = map[0].length;
        for (var j = 0; j < size; j++) {
            maproteun[j] = [];
            for ( var i = 0; i < size ; i++) {
                maproteun[j][i] = map[size - i - 1][j];
            }
        }
        map = maproteun;
        drawMap();
    });
    document.getElementById("controls").appendChild(rot);
}

init();
allowRotate();