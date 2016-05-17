var KinectPoint = function(div_id) {
    if ( !Detector.webgl ) {
        document.body.appendChild( Detector.getWebGLErrorMessage() );
        return;
    }

    var __this = this;

    // 0.0 for user mode
    // 0.2 for debuggging mode
    this.workMode = new THREE.Vector4(Kinect.ColorMode.r, Kinect.ColorMode.g,
                                      Kinect.ColorMode.b, Kinect.ColorMode.a);

    var width = 640, height = 480;
    // Kinect common range: 200mm to 1000mm
    var nearClipping = 200, farClipping = 1000;

    var kinectXFactor = 0.1,
        kinectZFactor = 0.1,
        mapFactor = 30.5,
        mapFactor2 = 21.7,
        xin = 0,
        yin = 0,
        ain = 0;

    var flagSize = 100,
        wp_xin = 0,
        wp_yin = 0;

    // Pose Test data
    //xin = 73.6 * mapFactor;
    //yin = 37.4 * mapFactor2;
    //ain = 3.92;

    // Math for map texture mapping
    var d_mapScale = 1.0;
    var d_mapFar = 10.0 * mapFactor * d_mapScale;

    var mw = 4096.0;
    var mh = 1024.0;

    xt_start = xin/mw;
    yt_start = yin/mh;
    xt_end = xt_start + d_mapFar * Math.cos(ain)/mw;
    yt_end = yt_start + d_mapFar * Math.sin(ain)/mh;
    bricks = [
        new THREE.Vector2(xt_start + d_mapFar * 0.5 * Math.cos(Math.PI/2 - ain) / mw,
                          yt_start - d_mapFar * 0.5 * Math.sin(Math.PI/2 - ain) / mh),
        new THREE.Vector2(xt_end + d_mapFar * 0.5 * Math.cos(Math.PI/2 - ain) / mw,
                          yt_end - d_mapFar * 0.5 * Math.sin(Math.PI/2 - ain) / mh),
        new THREE.Vector2(xt_end - d_mapFar * 0.5 * Math.cos(Math.PI/2 - ain) / mw,
                          yt_end + d_mapFar * 0.5 * Math.sin(Math.PI/2 - ain) / mh),
        new THREE.Vector2(xt_start - d_mapFar * 0.5 * Math.cos(Math.PI/2 - ain) / mw,
                          yt_start + d_mapFar * 0.5 * Math.sin(Math.PI/2 - ain) / mh)
    ];

    // Math for grid
    var gNum = 10.0 * d_mapScale;
    var gSize = (nearClipping + farClipping)/2,
        iStep = gSize/gNum;
    var gBottom = - 0.19 * (farClipping - nearClipping) * 0.83359,
        jStep = -gBottom/gNum/2.0;

    this.container = document.getElementById(div_id);

    this.stats = new Stats();
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.left = CanvasConfig.width/2 + 'px';
    //this.container.appendChild( this.stats.domElement );

    this.camera = new THREE.CombinedCamera( CanvasConfig.width / 2, CanvasConfig.height / 2, 58, 1, 5000, -1000, 5000 );
    this.lookAtScene = true;
    this.cameraRadius = gSize;
    this.camera.position.set(0, 200, -this.cameraRadius);

    //Waypoint Test Data
    wp_xin = 70.2;
    wp_yin = 35.4;

    //FIXME: Math for Waypoint
    var rxin = xin/mapFactor;
    var ryin = yin/mapFactor2;
    var d_wpFar = Math.sqrt((xin - wp_xin) * (xin - wp_xin) + (yin - wp_yin) * (yin - wp_yin));
    var wp_xend = d_wpFar * Math.cos(ain + Math.atan((yin - wp_yin)/(xin - wp_xin))) * 10;
    var wp_yend = d_wpFar * Math.sin(ain + Math.atan((yin - wp_yin)/(xin - wp_xin))) * 10 + this.cameraRadius;

    // Draw map
    var mapTexture = new THREE.Texture(mapBuffer);
    mapTexture.minFilter =  mapTexture.magFilter = THREE.LinearFilter;
    var mapMaterial = new THREE.MeshBasicMaterial({ map : mapTexture,
                                                    transparent: true,
                                                    opacity: 0.9});
    var mapGeometry = new THREE.PlaneGeometry(gSize * 2, gSize * 2);
    mapGeometry.faceVertexUvs[0] = [];
    mapGeometry.faceVertexUvs[0].push([ bricks[0], bricks[1], bricks[3] ]);
    mapGeometry.faceVertexUvs[0].push([ bricks[1], bricks[2], bricks[3] ]);
    this.mapPlane = new THREE.Mesh(mapGeometry, mapMaterial);
    this.mapPlane.material.side = THREE.DoubleSide;
    this.mapPlane.position.y = gBottom;
    this.mapPlane.position.z = gSize/2;
    this.mapPlane.rotation.x = -Math.PI/2;
    //mapPlane.rotation.y = ain;

    // Draw grid
    var gridGeometry = new THREE.Geometry();
    for ( var i = - gSize, j = gBottom; i <= gSize; i += iStep, j += jStep ) {
        gridGeometry.vertices.push( new THREE.Vector3( - gSize, gBottom, i));
        gridGeometry.vertices.push( new THREE.Vector3(   gSize, gBottom, i));
        gridGeometry.vertices.push( new THREE.Vector3( i, gBottom, - gSize));
        gridGeometry.vertices.push( new THREE.Vector3( i, gBottom,   gSize));
    }
    var gridMaterial = new THREE.LineBasicMaterial( { color: 0xff0000, opacity: 0.5 } );
    this.gridLines = new THREE.LineSegments( gridGeometry, gridMaterial );
    this.gridLines.rotation.y = -ain;

    // Kinect points
    var pointGeometry = new THREE.BufferGeometry();
    var vertices = new Float32Array( width * height * 3 );
    for ( var i = 0, j = 0, l = vertices.length; i < l; i += 3, j ++ ) {
        vertices[ i ] = j % width;
        vertices[ i + 1 ] = Math.floor( j / width );
    }
    pointGeometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

    var pointMaterial = new THREE.ShaderMaterial( {
        uniforms: {
            "depthMap": { type: "t", value: depthTexture },
            "rgbMap": { type: "t", value: rgbTexture },
            "width": { type: "f", value: width },
            "height": { type: "f", value: height },
            "nearClipping": { type: "f", value: nearClipping },
            "farClipping": { type: "f", value: farClipping },
            "depthScale": { type: "f", value: 1.0},
            "depthClipping": { type: "f", value: 0.8 },
            "modelScale" : { type: "f", value: 1.0 },
            "modelTransZ": { type: "f", value: this.cameraRadius },
            "pointSize": { type: "f", value: 5 },
            "colorMode": { type: "4fv", value: this.workMode}
        },
        vertexShader: document.getElementById( 'kpvs' ).textContent,
        fragmentShader: document.getElementById( 'kpfs' ).textContent,
        blending: THREE.NormalBlending,
        depthTest: true, depthWrite: true,
        transparent: true
    } );
    this.pointMesh = new THREE.Points( pointGeometry, pointMaterial );

    var flagUrl = "/images/flag.png";
    var flagTexture = new THREE.TextureLoader().load(flagUrl);
    flagTexture.minFilter = flagTexture.magFilter = THREE.LinearFilter;
    var flagMaterial = new THREE.MeshBasicMaterial({ map : flagTexture, transparent: true });
    this.flagPlane = new THREE.Mesh(new THREE.PlaneGeometry(flagSize, flagSize), flagMaterial);
    this.flagPlane.material.side = THREE.DoubleSide;
    this.flagPlane.position.x = wp_xend; //-330
    this.flagPlane.position.z = wp_yend; //-10
    this.flagPlane.position.y = gBottom + flagSize/2;
    this.flagPlane.material.opacity = 1.0;

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias:true,
                                              premultipliedAlpha : false});
    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.top = CanvasConfig.position.y + "px";
    this.renderer.domElement.style.left = CanvasConfig.position.x + "px";
    //this.renderer.setClearColor( 0x0000ff, 0.5 );
    this.renderer.setPixelRatio( CanvasConfig.width / CanvasConfig.height );
    this.renderer.setSize( CanvasConfig.width, CanvasConfig.height );
    this.container.appendChild( this.renderer.domElement );

    // Real scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog( 0x000000, (nearClipping + farClipping)/2, nearClipping + farClipping );
    this.sceneTexture = new THREE.WebGLRenderTarget( CanvasConfig.width, CanvasConfig.height, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter});

    // scene objects for detection only
    this.detectObjectScene = new THREE.Scene();
    this.detectObjectTexture = new THREE.WebGLRenderTarget( CanvasConfig.width, CanvasConfig.height, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter});

    // Edge detection scene
    this.detectScene = new THREE.Scene();
    this.detectTexture = new THREE.WebGLRenderTarget( CanvasConfig.width, CanvasConfig.height, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter});
    var detectMaterial = new THREE.ShaderMaterial( {
        uniforms: {
            "sceneMap": { type: "t", value: this.detectObjectTexture },
            "width": { type: "f", value: CanvasConfig.width },
            "height": { type: "f", value: CanvasConfig.height },
        },
        vertexShader: document.getElementById( 'edvs' ).textContent,
        fragmentShader: document.getElementById( 'edfs' ).textContent,
        blending: THREE.NormalBlending,
        depthTest: true, depthWrite: true,
        transparent: false
    } );
    var detectPlane = new THREE.Mesh(new THREE.PlaneGeometry(CanvasConfig.width, CanvasConfig.height), detectMaterial);
    detectPlane.material.side = THREE.DoubleSide;

    // Create a different scene to hold our buffer objects
    this.bufferCamera = new THREE.OrthographicCamera( CanvasConfig.width / - 2, CanvasConfig.width / 2, CanvasConfig.height / 2, CanvasConfig.height / - 2, -100, 1000 );

    this.bufferScene = new THREE.Scene();
    var bufferMaterial = new THREE.ShaderMaterial( {
        uniforms: {
            "sceneMap": { type: "t", value: this.sceneTexture },
            "edgeMap": { type: "t", value: this.detectTexture },
            "width": { type: "f", value: CanvasConfig.width },
            "height": { type: "f", value: CanvasConfig.height },
        },
        vertexShader: document.getElementById( 'bsvs' ).textContent,
        fragmentShader: document.getElementById( 'bsfs' ).textContent,
        blending: THREE.NormalBlending,
        depthTest: true, depthWrite: true,
        transparent: false
    } );
    var bufferPlane = new THREE.Mesh(new THREE.PlaneGeometry(CanvasConfig.width, CanvasConfig.height), bufferMaterial);
    bufferPlane.material.side = THREE.DoubleSide;

    this.animate = function() {
        requestAnimationFrame(__this.animate.bind(__this));

        __this.render();
        __this.stats.update();
    };

    this.render = function() {
        var timer = Date.now() * 0.0001;

        mapTexture.needsUpdate = true;

        __this.workMode = new THREE.Vector4(Kinect.ColorMode.r, Kinect.ColorMode.g,
                                            Kinect.ColorMode.b, Kinect.ColorMode.a);
        __this.pointMesh.material.uniforms.colorMode.value = __this.workMode;

        // Rotate the camera for Test
        //__this.camera.position.x = Math.cos( -Math.PI/2 - timer) * __this.cameraRadius;
        //__this.camera.position.z = Math.sin( -Math.PI/2 - timer) * __this.cameraRadius;

        // Rotate the ground for Test
        /*
        ain = timer;

        xt_start = xin/mw;
        yt_start = yin/mh;
        xt_end = xt_start + d_mapFar * Math.cos(ain)/mw;
        yt_end = yt_start + d_mapFar * Math.sin(ain)/mh;
        bricks = [
            new THREE.Vector2(xt_start + d_mapFar * 0.5 * Math.cos(Math.PI/2 - ain) / mw,
                              yt_start - d_mapFar * 0.5 * Math.sin(Math.PI/2 - ain) / mh),
            new THREE.Vector2(xt_end + d_mapFar * 0.5 * Math.cos(Math.PI/2 - ain) / mw,
                              yt_end - d_mapFar * 0.5 * Math.sin(Math.PI/2 - ain) / mh),
            new THREE.Vector2(xt_end - d_mapFar * 0.5 * Math.cos(Math.PI/2 - ain) / mw,
                              yt_end + d_mapFar * 0.5 * Math.sin(Math.PI/2 - ain) / mh),
            new THREE.Vector2(xt_start - d_mapFar * 0.5 * Math.cos(Math.PI/2 - ain) / mw,
                              yt_start + d_mapFar * 0.5 * Math.sin(Math.PI/2 - ain) / mh)
        ];

        __this.gridLines.rotation.y = -ain;

        var mapGeometryTemp = new THREE.PlaneGeometry(gSize * 2, gSize * 2);
        mapGeometryTemp.faceVertexUvs[0] = [];
        mapGeometryTemp.faceVertexUvs[0].push([ bricks[0], bricks[1], bricks[3] ]);
        mapGeometryTemp.faceVertexUvs[0].push([ bricks[1], bricks[2], bricks[3] ]);
        __this.mapPlane.geometry = mapGeometryTemp;
        //__this.mapPlane.geometry.needsUpdate = true;
        */

        if ( __this.lookAtScene )
            __this.camera.lookAt( __this.scene.position );

        // Render the real scene
        __this.scene.add( __this.mapPlane );
        __this.scene.add( __this.gridLines );
        __this.scene.add( __this.pointMesh );
        //__this.scene.add( __this.flagPlane );

        if (Kinect.ColorMode.a < 0.3) {
            __this.renderer.render(__this.scene, __this.camera);
        } else {
            __this.renderer.render(__this.scene, __this.camera, __this.sceneTexture);

            // Render the objects for detection only
            __this.detectObjectScene.add( __this.mapPlane );
            __this.detectObjectScene.add( __this.pointMesh );
            __this.renderer.render(__this.detectObjectScene, __this.camera, __this.detectObjectTexture);

            // Perform edge detection
            __this.detectScene.add( detectPlane );
            __this.renderer.render(__this.detectScene, __this.bufferCamera, __this.detectTexture);

            // Render the visiable scene using the two textures above
            __this.bufferScene.add( bufferPlane );
            __this.renderer.render( __this.bufferScene, __this.bufferCamera);
        }
    };

    var poseSubscriber = new ROSLIB.Topic({
        ros : ros,
        name : "/cari/pose",
        //messageType : "geometry_msgs/Point",
        //messageType : "corobot_common/Pose",
        queue_size: 1
    }).subscribe(function(msg) {
        xin = msg.x * mapFactor;
        yin = msg.y * mapFactor2;
        ain = msg.theta;

        xt_start = xin/mw;
        yt_start = yin/mh;
        xt_end = xt_start + d_mapFar * Math.cos(ain)/mw;
        yt_end = yt_start + d_mapFar * Math.sin(ain)/mh;
        bricks = [
        new THREE.Vector2(xt_start + d_mapFar * 0.5 * Math.cos(Math.PI/2 - ain) / mw,
        yt_start - d_mapFar * 0.5 * Math.sin(Math.PI/2 - ain) / mh),
        new THREE.Vector2(xt_end + d_mapFar * 0.5 * Math.cos(Math.PI/2 - ain) / mw,
        yt_end - d_mapFar * 0.5 * Math.sin(Math.PI/2 - ain) / mh),
        new THREE.Vector2(xt_end - d_mapFar * 0.5 * Math.cos(Math.PI/2 - ain) / mw,
        yt_end + d_mapFar * 0.5 * Math.sin(Math.PI/2 - ain) / mh),
        new THREE.Vector2(xt_start - d_mapFar * 0.5 * Math.cos(Math.PI/2 - ain) / mw,
        yt_start + d_mapFar * 0.5 * Math.sin(Math.PI/2 - ain) / mh)
        ];

        __this.gridLines.rotation.y = -ain;

        var mapGeometryTemp = new THREE.PlaneGeometry(gSize * 2, gSize * 2);
        mapGeometryTemp.faceVertexUvs[0] = [];
        mapGeometryTemp.faceVertexUvs[0].push([ bricks[0], bricks[1], bricks[3] ]);
        mapGeometryTemp.faceVertexUvs[0].push([ bricks[1], bricks[2], bricks[3] ]);
        __this.mapPlane.geometry = mapGeometryTemp;
        //__this.mapPlane.geometry.needsUpdate = true;
    });

    var waypoint = new ROSLIB.Topic({
        ros : ros,
        name : "/cari/waypoints",
        messageType : "geometry_msgs/Point",
        queue_size: 1
    }).subscribe(function(msg) {
        //wp_xin = msg.x;
        //wp_yin = msg.y;

        //TODO

        //__this.flagPlane.position.x = wp_xend;
        //__this.flagPlane.position.z = wp_yend;
    });

    // Unused
    var waypointReached = new ROSLIB.Topic({
        ros : ros,
        name : "/cari/waypoints_reached",
        messageType : "geometry_msgs/Point",
        queue_size: 1
    }).subscribe(function(msg) {
    });

    //Unused
    var waypointFailed = new ROSLIB.Topic({
        ros : ros,
        name : "/cari/waypoints_failed",
        messageType : "geometry_msgs/Point",
        queue_size: 1
    }).subscribe(function(msg) {
    });
};
