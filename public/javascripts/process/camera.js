var createCameraCanvas = function( p ) {
  var rgbUrl = JData.rgb_url;
  var depthUrl = JData.depth_url;

  p.setup = function() {
    rgbImage = createImg(rgbUrl)
    rgbImage.id("kinectRGB");
    rgbImage.parent("hideView");
    rgbImage.position(4, 4);

    depthImage = createImg(depthUrl);
    depthImage.id("kinectDepth");
    depthImage.parent("hideView");
    depthImage.position(4, 4);

    var c = p.createCanvas(709, 189);
    c.position(290, 590);
  };

  p.draw = function() {
    p.image(depthImage, 0, 0, 336, 189);
    p.image(rgbImage, 373, 0, 336, 189);
  };
};
