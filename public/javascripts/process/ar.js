var createARCanvas = function(p) {
    var mapUrl = MapFileConfig.blue_map_url
    var mapOrigin_x = MapFileConfig.origin_x;
    var mapOrigin_y = MapFileConfig.origin_y;
    var mapRes = MapFileConfig.resolution;
    var img;

    var mapFactor = 1.0 / mapRes;

    var xin = 0,
        yin = 0,
        globalPathLength = 0,
        localPathLength = 0;

    var localPathTransform;

    var numSegments = 0,
        x = [],
        y = [],
        angle = [],
        xl = [],
        yl = [],
        anglel = [],
        segLength = 4.0;

    // Waypoint Test data
    // xin = -mapOrigin_x * mapFactor;
    // yin = MapFileConfig.height + mapOrigin_y * mapFactor;
    // wp_xin = 512;
    // wp_yin = 512;

    var poseSubscriber = new ROSLIB.Topic({
        ros: ros,
        name: "/cari/pose",
        messageType: "geometry_msgs/Pose",
        queue_size: 1
    }).subscribe(function(msg) {
        xin = -(mapOrigin_x - msg.position.x) * mapFactor;
        yin = MapFileConfig.height + (mapOrigin_y - msg.position.y) * mapFactor;
    });

    var globalPathSubscriber = new ROSLIB.Topic({
        ros: ros,
        name: "/move_base/NavfnROS/plan",
        messageType: "nav_msgs/Path",
        queue_size: 1
    }).subscribe(function(msg) {
        globalPathLength = msg.poses.length;
        for (var i = 0; i < msg.poses.length; i++) {
            x[i] = -(mapOrigin_x - msg.poses[i].pose.position.x) * mapFactor;
            y[i] = MapFileConfig.height + (mapOrigin_y - msg.poses[i].pose.position.y) * mapFactor;
            var msg_rotation = new THREE.Euler().setFromQuaternion(msg.poses[i].pose.orientation);
            angle[i] = -msg_rotation.z;
        }
    });

    var tfClient = new ROSLIB.TFClient({
        ros: ros,
        fixedFrame: "map",
        angularThres: 0.01,
        transThres: 0.01
    }).subscribe("odom", function(tf) {
        localPathTransform = tf;
    });

    var localPathSubscriber = new ROSLIB.Topic({
        ros: ros,
        name: "/move_base/TebLocalPlannerROS/local_plan",
        messageType: "nav_msgs/Path",
        queue_size: 1
    }).subscribe(function(msg) {
        localPathLength = msg.poses.length;
        // odom to map transform

        for (var i = 0; i < msg.poses.length; i++) {
            var iPose = new ROSLIB.Pose({
                position: msg.poses[i].pose.position,
                orientation: msg.poses[i].pose.orientation
            });
            if (localPathTransform) {
                iPose.applyTransform(localPathTransform);
            }
            xl[i] = -(mapOrigin_x - iPose.position.x) * mapFactor;
            yl[i] = MapFileConfig.height + (mapOrigin_y - iPose.position.y) * mapFactor;
            var msg_rotation = new THREE.Euler().setFromQuaternion(iPose.orientation);
            anglel[i] = -msg_rotation.z;
        }
    });

    p.setup = function() {
        //p.pixelDensity(1);

        var c = p.createCanvas(CanvasConfig.mapWidth, CanvasConfig.mapHeight);
        c.id("arCanvas");
        //c.position(CanvasConfig.position.x, CanvasConfig.position.y/2);

        img = loadImage(mapUrl);

        // p.background('rgba(255, 0, 0, 0.2)');
        // p.noLoop();
        p.frameRate(30);

        x[x.length - 1] = xin; // Set base x-coordinate
        y[x.length - 1] = yin; // Set base y-coordinate

        c.hide();
    };

    p.draw = function() {
        p.clear();
        p.image(img, 0, 0);

        if (xin > 0 && yin > 0) {
            var d_wpFar;
            // Draw global path
            if (globalPathLength > 0) {
                numSegments = globalPathLength;
                d_wpFar = Math.sqrt((xin - x[numSegments - 1]) *
                    (xin - x[numSegments - 1]) + (yin - y[numSegments - 1]) *
                    (yin - y[numSegments - 1]));
                segLength = d_wpFar / (numSegments + 1.0);

                p.stroke(0, 255, 0, 255);
                p.fill(0, 255, 0, 255);
                crossHead(x[numSegments - 1], y[numSegments - 1], angle[numSegments - 1]);
                for (var k = 0; k < numSegments; k++) {
                    segment(x[k], y[k], angle[k], 1);
                }
            }
            // Draw local path
            if (localPathLength > 0) {
                numSegments = localPathLength;
                d_wpFar = Math.sqrt((xin - xl[numSegments - 1]) *
                    (xin - xl[numSegments - 1]) + (yin - yl[numSegments - 1]) *
                    (yin - yl[numSegments - 1]));
                segLength = d_wpFar / (numSegments + 1.0);

                p.stroke(255, 0, 0, 255);
                p.fill(255, 0, 0, 255);
                for (var k = 0; k < numSegments; k++) {
                    segment(xl[k], yl[k], anglel[k], 1);
                }
            }
        }

        // Draw everything to map texture for three.js kinect point cloud scene
        mc = document.getElementById("arCanvas");
        mapBufferContext.clearRect(0, 0, CanvasConfig.mapWidth, CanvasConfig.mapHeight);
        mapBufferContext.drawImage(mc, 0, 0);
    };

    function crossHead(x, y, a) {
        var chl = 6;
        p.strokeWeight(2);
        p.push();
        p.translate(x, y);
        p.rotate(a + Math.PI / 4);
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
        p.triangle(segLength * 1.5, 0, segLength * 0.2, -segLength / 2, segLength * 0.2, segLength / 2);
        p.pop();
    }

    function segment(x, y, a, sw) {
        p.strokeWeight(0.5);
        p.push();
        p.translate(x, y);
        p.rotate(a);
        p.quad(0, -sw, 0, sw, segLength, sw * 0.1, segLength, -sw * 0.1)
        //p.line(0, 0, segLength, 0);
        p.pop();
    }
};
