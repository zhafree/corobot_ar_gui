var createRGBDCanvas = function(p) {
    var img;

    // p.setup = function() {
    //   p.pixelDensity(1);
    //
    //   var c = p.createCanvas(CanvasConfig.minWidth/2, CanvasConfig.minHeight/2);
    //   c.id("rgbdCanvas");
    //   c.position(16, CanvasConfig.position.y/2 + 28);
    //   //p.background('rgba(255, 0, 0, 0.2)');
    //   p.noLoop();
    //   //p.frameRate(30);
    //
    //   defaultScale = CanvasConfig.width/CanvasConfig.minWidth;
    //   img = p.createImage(CanvasConfig.minWidth, CanvasConfig.minHeight);
    // };

    p.setup = function() {
        p.pixelDensity(1);

        var c = p.createCanvas(CanvasConfig.width, CanvasConfig.height);
        c.id("rgbdCanvas");
        c.position((windowWidth - CanvasConfig.width) / 2, (windowHeight - CanvasConfig.height) / 2);
        //p.background('rgba(255, 0, 0, 0.2)');
        p.noLoop();
        //p.frameRate(30);

        defaultScale = CanvasConfig.width / CanvasConfig.minWidth;
        img = p.createImage(CanvasConfig.minWidth, CanvasConfig.minHeight);
    };

    var skip = 1;
    p.draw = function() {
        p.clear();
        p.push();
        //p.scale(CanvasConfig.scale);
        p.scale(defaultScale);

        var record = 0;
        var rx = 0;
        var ry = 0;

        img.loadPixels();
        for (var i = 0; i < img.width; i += skip) {
            for (var j = 0; j < img.height; j += skip) {
                var offset = (i + j * img.width) * 4;
                var d = Kinect.depthPixels[offset];
                img.pixels[offset] = Kinect.rgbPixels[offset];
                img.pixels[offset + 1] = Kinect.rgbPixels[offset + 1];
                img.pixels[offset + 2] = Kinect.rgbPixels[offset + 2];
                img.pixels[offset + 3] = 255;
            }
        }
        img.updatePixels();
        p.image(img, 0, 0);
        p.pop();
    };
};
