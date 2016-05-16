var createARCanvas = function( p ) {
  var numSegments = 10,
      x = [],
      y = [],
      angle = [],
      segLength = 40,
      targetX, targetY;

  for (var i = 0; i < numSegments; i++) {
    x[i] = 0;
    y[i] = 0;
    angle[i] = 0;
  }

  var waypointSubscriber = new ROSLIB.Topic({
    ros : ros,
    name : "/cari/waypoints",
    messageType : "geometry_msgs/Point",
    queue_size: 1
  }).subscribe(function(msg) {
    // TODO
    //reachSegment(0, msg.x * CanvasConfig.scale, msg.y * CanvasConfig.scale);
  });

  p.setup = function() {
    p.pixelDensity(1);

    var c = p.createCanvas(CanvasConfig.width, CanvasConfig.height);
    c.id("rgbdCanvas");
    c.position(CanvasConfig.position.x, CanvasConfig.position.y/2);
    //p.background('rgba(255, 0, 0, 0.2)');
    //p.noLoop();
    p.frameRate(30);

    x[x.length-1] = CanvasConfig.width/2; // Set base x-coordinate
    y[x.length-1] = CanvasConfig.height;  // Set base y-coordinate
  };

  p.draw = function() {
    p.clear();

    p.strokeWeight(20);
    p.stroke(0, 255, 0, 100);

    reachSegment(0, 1010, 650);
    //reachSegment(0, 930, 600); //error

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
