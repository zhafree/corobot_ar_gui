var data = JSON.parse(JsonData);
ip = data.server_ip;

var rgbUrl = "http://" + ip + ":3000/rgb_image";
var depthUrl = "http://" + ip + ":3000/depth_image";

var canvas;
var rgbImage;
var depthImage;

function setup() {
  rgbImage = createImg(rgbUrl);
  rgbImage.position(0, 0);
  depthImage = createImg(depthUrl);
  depthImage.position(0, 0);

  canvas = createCanvas(800, 800);
  canvas.position(0, 0);
}

function draw() {
  background(250);

  image(rgbImage, 20, 20, 640, 360);
  image(depthImage, 20, 400, 640, 360);
}
