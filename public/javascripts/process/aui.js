var createAUICanvas = function( p ) {
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
    var canvasPos;
    var width;
    var height;

    var roundBoundry = 4;

    var xLast = 0,
        yLast = 0,
        mapFactor = 30.5,
        xin = 0,
        yin = 0,
        ain = 0;

    // Test data
    xin = 86.6976625179 * mapFactor;
    yin = 1440 - 35.3127561632 * mapFactor;
    ain = -8.59161182583;
    //xin = 94.008 * mapFactor;
    //yin = 1440 - 34.031 * mapFactor;
    //xin = 86.308 * mapFactor;
    //yin = 1440 - 36.531 * mapFactor;
    //ain = -7.0543465492;
    //xin = 86.908 * mapFactor;
    //yin = 1440 - 33.031 * mapFactor;
    //ain = -8.131;

    var poseSubscriber = new ROSLIB.Topic({
        ros : ros,
        name : "/cari/pose",
        messageType : "corobot_common/Pose",
        queue_size: 1
    }).subscribe(function(msg) {
        //xin = msg.x * mapFactor;
        //yin = 1440 - msg.y * mapFactor;
        //ain = -msg.theta;
    });

    p.preload = function() {
        mapImage = loadImage(mapUrl);
    }

    p.setup = function() {
        width = height = CanvasConfig.height/2;
        canvasPos = createVector(windowWidth - width, windowHeight - height);
        current = createVector(0, 0);
        previous = createVector(0, 0);
        mapTrans = createVector(0, 0);
        mapPos = createVector(120 * CanvasConfig.scale, 120 * CanvasConfig.scale);

        var c = p.createCanvas(width, height);
        c.id("auiCanvas");
        c.position(canvasPos.x, canvasPos.y);
        //p.background('rgba(0, 0, 255, 0.2)');
        p.frameRate(30);

        slider = p.createSlider(10.0, sliderMax, sliderMax/2);
        slider.position(canvasPos.x + width/2 - slider.width/2, canvasPos.y + height - slider.height * 2.5);
    };

    p.draw = function() {
        p.clear();

        // Set colors
        p.stroke('rgba(127, 63, 120, 0)');
        p.ellipseMode(RADIUS);
        p.fill('rgba(255, 255, 255, 0.8)');
        p.ellipse(width/2, height/2, width/2 - roundBoundry, height/2 - roundBoundry);
        var mapMask = p.get();

        // Update scale value
        scaleLevel = slider.value()/sliderMax*2;

        // Update translate
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

        p.rect(0, 0, width, height);
        p.push();
        p.translate(mapTrans.x, mapTrans.y);
        p.scale(scaleLevel, scaleLevel);

        p.translate(-xin, -yin);
        p.image(mapImage, mapPos.x, mapPos.y);
        p.pop();

        p.strokeWeight(3);
        p.stroke(127, 63, 120);
        p.fill(204, 101, 192, 127);
        p.push();
        p.translate(mapTrans.x, mapTrans.y);
        p.scale(scaleLevel, scaleLevel);
        p.translate(width/2, height/2);
        p.rotate(ain);
        p.triangle(20, 0, -10, -10, -10, 10);
        p.pop();
        var mapReal = p.get();

        p.clear();
        mapReal.mask(mapMask);
        p.image(mapReal, 0, 0);

        p.strokeWeight(roundBoundry);
        p.ellipseMode(RADIUS);
        p.fill('rgba(200, 200, 200, 0.0)');
        p.ellipse(width/2, height/2, width/2 - roundBoundry, height/2 - roundBoundry);
    };

    p.mousePressed = function() {
        if (p.mouseY < height - slider.height * 2.5 && p.mouseY > 0 &&
            p.mouseX > 0 && p.mouseX < width) {
            painting = true;
            previous.x = p.mouseX;
            previous.y = p.mouseY;
        }
    };

    p.mouseReleased = function() {
        painting = false;
    };
};
