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
  var mapPos;

  p.preload = function() {
    mapImage = loadImage(mapUrl);
  }

  p.setup = function() {
    mapPos = createVector(-20, -1160);
    current = createVector(0, 0);
    previous = createVector(0, 0);

    var c = p.createCanvas(720, 524);
    c.position(286, 30);

    slider = p.createSlider(10.0, sliderMax, sliderMax/2);
    slider.position(860, 524);
  };

  p.draw = function() {
    p.background(255);

    // Apply scale
    scaleLevel = slider.value()/sliderMax*2;
    p.scale(scaleLevel, scaleLevel);

    // FIXME:
    // Map moved by cursor: area bug
    if (painting) {
      p.cursor(HAND);

      current.x = p.mouseX;
      current.y = p.mouseY;
      p.image(mapImage, mapPos.x + current.x - previous.x,
              mapPos.y + current.y - previous.y);
    } else {
      p.cursor(ARROW);
      p.image(mapImage, mapPos.x, mapPos.y);
    }

    // Set colors
    p.fill(204, 101, 192, 127);
    p.stroke(127, 63, 120);
    p.triangle(340, 262, 380, 242, 380, 282);

  };

  p.mousePressed = function() {
    if (p.mouseY < 494 && p.mouseY > 30) {
      painting = true;
      previous.x = p.mouseX;
      previous.y = p.mouseY;
    }
  };

  p.mouseReleased = function() {
    if (painting) {
      painting = false;
      mapPos.x += current.x - previous.x;
      mapPos.y += current.y - previous.y;
    }
  };
};
