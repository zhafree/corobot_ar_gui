var createRGBDCanvas = function( p ) {
  var img;
  var system;
  var minThresh = 25;
  var maxThresh = 200;

  var numSegments = 3,
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

  var goalSubscriber = new ROSLIB.Topic({
    ros : ros,
    name : "/cari/goal",
    messageType : "geometry_msgs/Point",
    queue_size: 1
  }).subscribe(function(msg) {
    console.log("goalSubscriber: " + JSON.stringify(msg));
    x[1] = 0;
    y[1] = 0;
    angle[1] = 0;
    x[2] = msg.x * 100 + x[numSegments - 1];
    y[2] = msg.y * 100 + y[numSegments - 1];
    angle[2] = msg.z;
  });

  var waypointSubscriber = new ROSLIB.Topic({
    ros : ros,
    name : "/cari/waypoints",
    messageType : "geometry_msgs/Point",
    queue_size: 1
  }).subscribe(function(msg) {
    //console.log("waypointSubscriber: " + msg);
    x[1] = msg.x * 100 + x[numSegments - 1];
    y[1] = msg.y * 100 + y[numSegments - 1];
    angle[1] = msg.z;
  });

  var waypointReachedSubscriber = new ROSLIB.Topic({
    ros : ros,
    name : "/cari/waypoints_reached",
    messageType : "geometry_msgs/Point",
    queue_size: 1

  }).subscribe(function(msg) {
    //console.log("waypointReachedSubscriber: " + msg);
    x[1] = 0;
    y[1] = 0;
    angle[1] = 0;
  });

  p.setup = function() {
    p.pixelDensity(1);

    var c = p.createCanvas(CanvasConfig.width, CanvasConfig.height);
    c.id("rgbdCanvas");
    c.position(CanvasConfig.position.x/2, CanvasConfig.position.y/2);
    //p.background('rgba(255, 0, 0, 0.2)');
    p.noLoop();
    //p.frameRate(30);

    defaultScale = CanvasConfig.width/CanvasConfig.minWidth;
    img = p.createImage(CanvasConfig.minWidth, CanvasConfig.minHeight);

    x[x.length-1] = CanvasConfig.width/2 + CanvasConfig.position.x/2; // Set base x-coordinate
    y[x.length-1] = CanvasConfig.height;  // Set base y-coordinate
  };

  var skip = 1;
  p.draw = function() {
    p.clear();
    p.push();
    //p.scale(CanvasConfig.scale);
    p.scale(0.5);

    var record = 0;
    var rx = 0;
    var ry = 0;

    img.loadPixels();
    for(var i = 0; i < img.width; i+=skip) {
      for(var j = 0; j < img.height; j+=skip) {
        var offset = (i + j * img.width) * 4;
        var d = Kinect.depthPixels[offset];
        img.pixels[offset] = Kinect.rgbPixels[offset];
        img.pixels[offset + 1] = Kinect.rgbPixels[offset + 1];
        img.pixels[offset + 2] = Kinect.rgbPixels[offset + 2];
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

    return;

    p.strokeWeight(20);
    p.stroke(0, 255, 0, 100);
    //reachSegment(0, rx * CanvasConfig.scale, ry * CanvasConfig.scale);
    reachSegment(0, x[2], y[2]);
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
