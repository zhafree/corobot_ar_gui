var createARCanvas = function( p ) {
  var mapUrl = "/images/pointDataMapBlue.png";
  var img;

  var mapFactor = 30.5,
      mapFactor2 = 21.7;

  var xin = 0,
      yin = 0,
      wp_xin = 0,
      wp_yin = 0;

  // Waypoint Test data
  //xin = 73.6 * mapFactor;
  //yin = 1024 - 37.4 * mapFactor2;
  //wp_xin = 70.2 * mapFactor;
  //wp_yin = 1024 - 37.4 * mapFactor2;

  var numSegments = 5.0,
      x = [],
      y = [],
      angle = [],
      segLength = 4.0,
      targetX, targetY;

  for (var i = 0; i < numSegments; i++) {
    x[i] = 0.0;
    y[i] = 0.0;
    angle[i] = 0.0;
  }

  var poseSubscriber = new ROSLIB.Topic({
    ros : ros,
    name : "/cari/pose",
    messageType : "geometry_msgs/Point",
    //messageType : "corobot_common/Pose",
    queue_size: 1
  }).subscribe(function(msg) {
    xin = msg.x * mapFactor;
    yin = 1024 - msg.y * mapFactor2;

    x[x.length-1] = xin;
    y[x.length-1] = yin;
  });

  var waypointSubscriber = new ROSLIB.Topic({
    ros : ros,
    name : "/cari/waypoints",
    messageType : "geometry_msgs/Point",
    queue_size: 1
  }).subscribe(function(msg) {
    wp_xin = msg.x * mapFactor;
    wp_yin = 1024 - msg.y * mapFactor2;
  });

  p.setup = function() {
    //p.pixelDensity(1);

    var c = p.createCanvas(CanvasConfig.mapWidth, CanvasConfig.mapHeight);
    c.id("arCanvas");
    //c.position(CanvasConfig.position.x, CanvasConfig.position.y/2);

    img = loadImage(mapUrl);

    //p.background('rgba(255, 0, 0, 0.2)');
    //p.noLoop();
    p.frameRate(30);

    x[x.length-1] = xin; // Set base x-coordinate
    y[x.length-1] = yin;  // Set base y-coordinate

    c.hide();
  };

  p.draw = function() {
    p.clear();
    p.image(img, 0, 0);

    if (xin > 0 && yin > 0 && wp_xin > 0 && wp_yin > 0) {
      var d_wpFar = Math.sqrt((xin - wp_xin) * (xin - wp_xin) + (yin - wp_yin) * (yin - wp_yin));
      segLength = d_wpFar/(numSegments + 1.0);

      p.stroke(0, 255, 0, 255);
      p.fill(0, 255, 0, 255);
      crossHead(wp_xin, wp_yin, angle[0]);

      //p.stroke(255, 255, 255, 255);
      reachSegment(0, wp_xin, wp_yin);

      for(var i=1; i<numSegments; i++) {
        reachSegment(i, targetX, targetY);
      }
      for(var j=x.length-1; j>=1; j--) {
        positionSegment(j, j-1);
      }
      segmentHead(x[0], y[0], angle[0], 2);
      for(var k=0; k<x.length; k++) {
        segment(x[k], y[k], angle[k], (k+1) + 1);
      }
    }

    // Draw everything to map texture for three.js kinect point cloud scene
    mc = document.getElementById("arCanvas");
    mapBufferContext.clearRect(0, 0, CanvasConfig.mapWidth, CanvasConfig.mapHeight);
    mapBufferContext.drawImage(mc, 0, 0);
  };

  function crossHead(x, y, a) {
    var chl = 12;
    p.strokeWeight(3);
    p.push();
    p.translate(x, y);
    p.rotate(a + Math.PI/4);
    p.line(0, -chl, 0, chl);
    p.line(-chl, 0, chl, 0);
    p.pop();
  }

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
    p.strokeWeight(0.5);
    p.push();
    p.translate(x, y);
    p.rotate(a);
    p.triangle(segLength*1.5, 0, segLength * 0.2, -segLength/2, segLength * 0.2, segLength/2);
    p.pop();
  }

  function segment(x, y, a, sw) {
    p.strokeWeight(0.5);
    p.push();
    p.translate(x, y);
    p.rotate(a);
    p.quad(0, - sw, 0, sw, segLength, sw - 1, segLength, - sw + 1)
    //p.line(0, 0, segLength, 0);
    p.pop();
  }
};
