// create all canvas here
// create zebra canvas of ui framework
var zebraCanvas;
function setup() {
  zebraCanvas = createCanvas(1024, 800);
  zebraCanvas.id("GUICanvas");
  zebraCanvas.parent("showView");

  // Set the bottom background for all canvas
  background(255);
  noLoop();
};

function draw() {
}

// create camera canvas for kinect views
var cameraCanvas = new p5(createCameraCanvas, "showView");

// create map canvas for map and navigation
var mapCanvas = new p5(createMapCanvas, "showView");
