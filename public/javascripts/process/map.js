var createMapCanvas = function( p ) {
  var mapUrl = "/images/pointDataMap.png";
  // scale
  var slider;
  var sliderMax = 100.0;
  var scaleLevel;
  // mouse tracking
  var painting = false;
  var current;
  var previous;
  // map transition
  var mapTrans;
  var mapPos;

  var xLast = 0,
      yLast = 0,
      xin = 360,
      yin = 262,
      ain = 0;

  var odomSubscriber = new ROSLIB.Topic({
    ros : ros,
    name : "/odom",
    messageType : "nav_msgs/Odometry",
    queue_size: 1
  }).subscribe(function(msg) {
    xin = 360 + msg.pose.pose.position.x * 100;
    yin = 262 - msg.pose.pose.position.y * 100;
    ain = - 2 * atan2(msg.pose.pose.orientation.z, msg.pose.pose.orientation.w);
  });

  p.preload = function() {
    mapImage = loadImage(mapUrl);
  }

  p.setup = function() {
    current = createVector(0, 0);
    previous = createVector(0, 0);
    mapTrans = createVector(0, 0);
    mapPos = createVector(-20, -1160);

    var c = p.createCanvas(720, 524);
    c.position(286, 30);

    slider = p.createSlider(10.0, sliderMax, sliderMax/2);
    slider.position(860, 524);
  };

  p.draw = function() {
    p.background(255);

    // Update scale value
    scaleLevel = slider.value()/sliderMax*2;

    // Update translate
    // FIXME:
    // Map moved by cursor uncorrectly at some area
    if (painting) {
      p.cursor(HAND);

      current.x = p.mouseX;
      current.y = p.mouseY;
      mapTrans.x += current.x - previous.x,
      mapTrans.y += current.y - previous.y;
      previous.x = current.x;
      previous.y = current.y;
    } else {
      p.cursor(ARROW);
    }
    p.translate(mapTrans.x, mapTrans.y);
    p.scale(scaleLevel, scaleLevel);

    // Set colors
    p.fill(204, 101, 192, 127);
    p.stroke(127, 63, 120);

    //xin = p.mouseX;
    //yin = p.mouseY;
    var dx = xin - xLast;
    var dy = yin - yLast;
    //var angle = atan2(dy, dx);
    //xLast = xin - cos(angle) * 20;
    //yLast = yin - sin(angle) * 20;

    p.push();
    //p.translate(-xLast, -yLast);
    p.translate(-dx, -dy);
    p.image(mapImage, mapPos.x, mapPos.y);
    p.pop();

    p.push();
    p.translate(360, 262);
    p.rotate(ain);
    p.triangle(20, 0, -10, -10, -10, 10);
    p.pop();
  };

  p.mousePressed = function() {
    if (p.mouseY < 494 && p.mouseY > 30) {
      painting = true;
      previous.x = p.mouseX;
      previous.y = p.mouseY;
    }
  };

  p.mouseReleased = function() {
    painting = false;
  };
};
