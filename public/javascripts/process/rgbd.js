var createRGBDCanvas = function( p ) {
  var img;

  p.setup = function() {
    p.pixelDensity(1);

    var c = p.createCanvas(CanvasConfig.width, CanvasConfig.height);
    c.id("rgbdCanvas");
    c.position(CanvasConfig.position.x, CanvasConfig.position.y);
    //p.background('rgba(255, 0, 0, 0.2)');
    p.noLoop();
    //p.frameRate(30);

    defaultScale = CanvasConfig.width/CanvasConfig.minWidth;
    img = p.createImage(CanvasConfig.minWidth, CanvasConfig.minHeight);
  };

  p.draw = function() {
    p.scale(CanvasConfig.scale);

    img.loadPixels();
    var x, y;
    for(x = 0; x < img.width; x++) {
      for(y = 0; y < img.height; y++) {
        var offset = (x + y * img.width) * 4;
        img.pixels[offset] = Kinect.depthPixels[offset] + Kinect.rgbPixels[offset+1];
        img.pixels[offset + 1] = Kinect.depthPixels[offset];
        img.pixels[offset + 2] = Kinect.depthPixels[offset];
        img.pixels[offset + 3] = 255;
      }
    }
    img.updatePixels();

    p.image(img, 0, 0);
  };
};
