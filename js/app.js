var canvas, context, board, tiles, display;
var NUM_OF_TILES = 6;

// Array where the images of the different tiles are stored
var imageObj = [];

// defines the position of the player in the viewport (vX and vY), the number of tiles in the
// viewport (vWidth + 1, vHeight + 1) and the size of the tiles
var vX, vY, vWidth, vHeight, vTileSize;

// Position of the player in the world
var playerX = 0,
    playerY = 0;

// These are the last indexes of width and height, so the real width and height are +1 
var worldWidth = 50,
    worldHeight = 30;

// // Create special portions of the map (like clusters and paths) and push them into an array
var specialTerrain = [];
// // specialTerrain.push(cluster(5, 5, 1, 1));
// // specialTerrain.push(cluster(5, 5, 2, 1));
// // specialTerrain.push(cluster(5, 5, 1, 2));
// // specialTerrain.push(cluster(5, 5, 2, 2));
// specialTerrain.push(path(1, 1, 20, 20));
// specialTerrain.push(path(1, 1, 20, 20));
// specialTerrain.push(path(25, 25, 3, 3));
// specialTerrain.push(path(1, 1, 1, 30));
// specialTerrain.push(path(4, 27, 45, 3));
// specialTerrain.push(path(15, 2, 20, 35));
// specialTerrain.push(path(15, 2, 20, 35));
// specialTerrain.push(path(15, 2, 20, 35));
// specialTerrain.push(cluster(5, 5, 4, 4));
// specialTerrain.push(cluster(5, 20, 4, 1));
// specialTerrain.push(cluster(10, 5, 1, 4));
// specialTerrain.push(cluster(5, 10, 4, 4));

// Create a map with the available tiles and the given size of the world
function loadMap(map) {
    if (map == 1) {
        var mapArray = [];
        for (var row = 0; row < worldHeight + 1; row++) {
            mapArray[row] = [];
            for (var col = 0; col < worldWidth + 1; col++) {
                mapArray[row][col] = Math.floor(Math.random() * (NUM_OF_TILES + 1));
            }
        }
        for (var i = 0; i < specialTerrain.length; i++) {
            pushTerrain(mapArray,
                specialTerrain[i].matrix,
                1,
                specialTerrain[i].origin[0],
                specialTerrain[i].origin[1]);
        }
        return mapArray;
    }
}


// Modifies the map with special terrains 
function pushTerrain(containerArray, terrain, tileIndex, xOrigin, yOrigin) {
    console.log("pushing specialTerrain now");
    console.log(terrain);
    for (var row = 0; row < terrain.length; row++) {
        for (var col = 0; col < terrain[row].length; col++) {
            if (terrain[row][col] === 1 && isInsideWorld(row + yOrigin, col + xOrigin)) {
                containerArray[row + yOrigin][col + xOrigin] = tileIndex;
            }
        }
    }
}


// Create a matrix of points in a cluster. The fullness gives a measure of how many tiles will
// be filled and the compactness gives more weight to the tiles closest to the center of the cluster 
function cluster(xSpread, ySpread, fullness, compactness) {
    clusterArray = [];
    var maxDistance = Math.pow(Math.pow(ySpread, 2) + Math.pow(xSpread, 2), 0.5);
    for (var row = 0; row < 2 * ySpread; row++) {
        for (var col = 0; col < 2 * xSpread; col++) {
            var currentDistance = Math.pow(Math.pow(row - ySpread, 2) + Math.pow(col - xSpread, 2), 0.5);
            if (Math.random() < fullness * Math.pow(1 - currentDistance / maxDistance, compactness)) {
                clusterArray.push([col, row]);
            }
        }
    }
    console.log(clusterArray);
    return array1DTo2D(clusterArray);
}


// Creates a path between two points. 
function path(xStart, yStart, xEnd, yEnd) {
    var xCurrent = xStart;
    var yCurrent = yStart;
    var totalDistance;
    var pathArray = [];
    pathArray.push([xStart, yStart]);
    while (xCurrent !== xEnd || yCurrent !== yEnd) {
        totalDistance = (Math.abs(xEnd - xCurrent) + Math.abs(yEnd - yCurrent));
        if (Math.random() * totalDistance < Math.abs(xEnd - xCurrent)) {
            xCurrent += (xEnd - xCurrent) / Math.abs(xEnd - xCurrent);
        } else {
            yCurrent += (yEnd - yCurrent) / Math.abs(yEnd - yCurrent);
        }
        pathArray.push([xCurrent, yCurrent]);
    }
    return array1DTo2D(pathArray);
}


// Converts an array with points as elements [x,y] into a 2D matrix
function array1DTo2D(array) {
    console.log(array);
    var xMax = array[0][0];
    var yMax = array[0][1];
    var xMin = array[0][0];
    var yMin = array[0][1];
    var isInArray = false;
    var array2D = []
    for (var pair = 0; pair < array.length; pair++) {
        xMax = (xMax < array[pair][0] ? array[pair][0] : xMax);
        yMax = (yMax < array[pair][1] ? array[pair][1] : yMax);
    }
    for (var pair = 0; pair < array.length; pair++) {
        xMin = (xMin > array[pair][0] ? array[pair][0] : xMin);
        yMin = (yMin > array[pair][1] ? array[pair][1] : yMin);
    }
    for (var row = 0; row <= yMax - yMin; row++) {
        array2D[row] = [];
        for (var col = 0; col <= xMax - xMin; col++) {
            isInArray = array.find(function(element, index) {
                return row === element[1] && col === element[0];
            });
            if (isInArray) {
                array2D[row][col] = 1;
            } else {
                array2D[row][col] = 0;
            }
        }
    }
    if (xMin === 0 && yMin === 0) { // Prevents the clusters to have their origin at [0,0] 
        xMin = Math.floor(Math.random() * worldHeight);
        yMin = Math.floor(Math.random() * worldWidth);
    }
    return {
        matrix: array2D,
        origin: [xMin, yMin]
    };
};


// Determines if a cell is inside the world limits or not
function isInsideWorld(row, col) {
    if (row >= 0 && row <= worldHeight && col >= 0 && col <= worldWidth) {
        return true;
    }
    return false;
}


// 
$(document).ready(function() {

    // Create canvas
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");

    // Canvas elements are not focusable by default. You need to set a tabIndex for it first.
    canvas.tabIndex = 0;
    canvas.focus();

    // Set the size of the tiles in the viewport
    vTileSize = 35;

    // Set the size of the canvas.
    canvas.width = $(window).width() - $(window).width() % vTileSize;
    canvas.height = $(window).height() - $(window).height() % vTileSize;

    // The number of tiles in the viewport depend on the canvas size through the size of each tile
    vWidth = Math.floor(canvas.width / vTileSize - 1);
    vHeight = Math.floor(canvas.height / vTileSize - 1);

    // Set initial position
    vX = 0;
    vY = 0;

    // Add event listener for keys to move the player
    canvas.addEventListener('keydown', function(e) {
        var key = null;
        switch (e.which) {
            case 37:
                // Left
                if (playerX > 0) playerX--;
                break;
            case 38:
                // Up
                if (playerY > 0) playerY--;
                break;
            case 39:
                // Right
                if (playerX < worldWidth) playerX++;
                break;
            case 40:
                // Down
                if (playerY < worldHeight) playerY++;
                break;
        }

        // Determine the "best" viewport.
        // Ideally the viewport centers the player, if it is too close to the edge correct it to 0
        vX = playerX - Math.floor(0.5 * vWidth);
        if (vX < 0) {
            vX = 0;
        }
        if (vX + vWidth > worldWidth) {
            vX = worldWidth - vWidth;
        }

        vY = playerY - Math.floor(0.5 * vHeight);
        if (vY < 0) {
            vY = 0;
        }
        if (vY + vHeight > worldHeight) {
            vY = worldHeight - vHeight;
        }

        draw();
    }, false);

    var board = [];

    board = loadMap(1);
    tiles = [];

    var loadedImagesCount = 0;
    for (x = 0; x <= NUM_OF_TILES; x++) {
        imageObj[x] = new Image(); // new instance for each image
        imageObj[x].src = "img/tiles/tile_" + x + ".png";

        imageObj[x].onload = function() {
            if (loadedImagesCount == NUM_OF_TILES) {
                // Once all tiles are loaded, we paint the map
                draw();
            }
            loadedImagesCount++;
        };
        tiles.push(imageObj[x]);
    }


    function draw() {

        // Clears the whole viewport
        context.clearRect(0, 0, canvas.width, canvas.height);


        for (y = 0; y <= vHeight; y++) {
            for (x = 0; x <= vWidth; x++) {
                theX = x * vTileSize;
                theY = y * vTileSize;
                context.drawImage(tiles[board[y + vY][x + vX]], theX, theY, vTileSize, vTileSize);
            }
        }
        context.fillStyle = 'red';
        context.fillRect((playerX - vX) * vTileSize, (playerY - vY) * vTileSize, vTileSize, vTileSize);
    }

});