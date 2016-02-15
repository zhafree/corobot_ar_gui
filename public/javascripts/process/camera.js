var createCameraCanvas = function( p ) {
  var ip = JData.server_ip;

  //var rgbUrl = "http://" + ip + ":3000/rgb_image";
  //var depthUrl = "http://" + ip + ":3000/depth_image";
  var rgbUrl = "/test/test_rgb.jpg";
  var depthUrl = "/test/test_depth.jpg";

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
