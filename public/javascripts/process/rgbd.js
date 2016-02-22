var createRGBDCanvas = function( p ) {
  var img;
  var system;
  var minThresh = 25;
  var maxThresh = 200;

  var numSegments = 10,
      x = [],
      y = [],
      angle = [],
      segLength = 50,
      targetX, targetY;

  for (var i = 0; i < numSegments; i++) {
    x[i] = 0;
    y[i] = 0;
    angle[i] = 0;
  }

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

    x[x.length-1] = CanvasConfig.width/2; // Set base x-coordinate
    y[x.length-1] = CanvasConfig.height;  // Set base y-coordinate
  };

  var skip = 4;
  p.draw = function() {
    p.clear();
    p.push();
    p.scale(CanvasConfig.scale);

    var record = 0;
    var rx = 0;
    var ry = 0;

    img.loadPixels();
    for(var i = 0; i < img.width; i+=skip) {
      for(var j = 0; j < img.height; j+=skip) {
        var offset = (i + j * img.width) * 4;
        var d = Kinect.depthPixels[offset];
        img.pixels[offset] = Kinect.rgbPixels[offset];
        img.pixels[offset + 1] = Kinect.rgbPixels[offset];
        img.pixels[offset + 2] = Kinect.rgbPixels[offset];
        img.pixels[offset + 3] = 255;

        if (d > minThresh && d < maxThresh && i > 100 && i < 500 && j > 200 && j < 360) {
          if (d > record) {
            record = d;
            rx = i;
            ry = j;
          }
        }
      }
    }
    img.updatePixels();
    p.image(img, 0, 0);
    p.pop();

    p.strokeWeight(20);
    p.stroke(0, 255, 0, 100);
    reachSegment(0, rx * CanvasConfig.scale, ry * CanvasConfig.scale);
    for(var i=1; i<numSegments; i++) {
      reachSegment(i, targetX, targetY);
    }
    for(var j=x.length-1; j>=1; j--) {
      positionSegment(j, j-1);
    }
    segmentHead(x[0], y[0], angle[0], 2);
    for(var k=0; k<x.length; k++) {
      segment(x[k], y[k], angle[k], (k+1)*2);
    }
  };

  function positionSegment(a, b) {
    x[b] = x[a] + cos(angle[a]) * segLength;
    y[b] = y[a] + sin(angle[a]) * segLength;
  }

  function reachSegment(i, xin, yin) {
    var dx = xin - x[i];
    var dy = yin - y[i];
    angle[i] = atan2(dy, dx);
    targetX = xin - cos(angle[i]) * segLength;
    targetY = yin - sin(angle[i]) * segLength;
  }

  function segmentHead(x, y, a, sw) {
    p.strokeWeight(sw);
    p.push();
    p.translate(x, y);
    p.rotate(a);
    p.triangle(40, 0, 0, -10, 0, 10);
    p.pop();
  }

  function segment(x, y, a, sw) {
    p.strokeWeight(sw);
    p.push();
    p.translate(x, y);
    p.rotate(a);
    p.line(0, 0, segLength, 0);
    p.pop();
  }
};
