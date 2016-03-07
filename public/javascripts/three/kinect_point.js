var KinectPoint = function(div_id) {
    if ( !Detector.webgl ) {
        document.body.appendChild( Detector.getWebGLErrorMessage() );
        return;
    }

    var __this = this;

    var width = 640, height = 480;
    var nearClipping = 3000, farClipping = 4000;

    this.container = document.getElementById(div_id);

    this.stats = new Stats();
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.top = '0px';
    //this.container.appendChild( this.stats.domElement );

    this.camera = new THREE.CombinedCamera( CanvasConfig.width / 2, CanvasConfig.height / 2, 70, 1, 5000, -1000, 5000 );
    this.lookAtScene = true;
    this.cameraRadius = (nearClipping + farClipping)/2;
    this.camera.position.set( 0, 0, -this.cameraRadius );

    this.scene = new THREE.Scene();
    //this.scene.fog = new THREE.Fog( 0x000000, (nearClipping + farClipping)/2, nearClipping + farClipping );

    // DrawGrid
    var gNum = 10.0;
    var gSize = (nearClipping + farClipping)/2,
        iStep = gSize/gNum;
    var gBottom = - 0.5 * (farClipping - nearClipping) * 0.83359,
        jStep = -gBottom/gNum/2.0;

    var gridGeometry = new THREE.Geometry();
    for ( var i = - gSize, j = gBottom; i <= gSize; i += iStep, j += jStep ) {
        gridGeometry.vertices.push( new THREE.Vector3( - gSize, j, i));
        gridGeometry.vertices.push( new THREE.Vector3(   gSize, j, i));
        gridGeometry.vertices.push( new THREE.Vector3( i, gBottom, - gSize));
        gridGeometry.vertices.push( new THREE.Vector3( i, 0,   gSize));
    }
    var gridMaterial = new THREE.LineBasicMaterial( { color: 0xffffff, opacity: 0.1 } );
    var gridLines = new THREE.LineSegments( gridGeometry, gridMaterial );
    this.scene.add( gridLines );

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

            "pointSize": { type: "f", value: 3 },
            "zOffset": { type: "f", value: 2425 }
        },
        vertexShader: document.getElementById( 'vs' ).textContent,
        fragmentShader: document.getElementById( 'fs' ).textContent,
        blending: THREE.AdditiveBlending,
        depthTest: true, depthWrite: true,
        transparent: true
    } );
    var pointMesh = new THREE.Points( pointGeometry, pointMaterial );
    this.scene.add( pointMesh );

    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.top = CanvasConfig.position.y + "px";
    this.renderer.domElement.style.left = CanvasConfig.position.x + "px";
    //this.renderer.setClearColor( 0x0000ff, 0.5 );
    this.renderer.setPixelRatio( CanvasConfig.width / CanvasConfig.height );
    this.renderer.setSize( CanvasConfig.width, CanvasConfig.height );
    this.container.appendChild( this.renderer.domElement );

    this.animate = function() {
        requestAnimationFrame(__this.animate.bind(__this));

        __this.render();
        __this.stats.update();
    };

    this.render = function() {
        var timer = Date.now() * 0.0001;

        //__this.camera.position.x = Math.cos( -Math.PI/2 - timer) * __this.cameraRadius;
        //__this.camera.position.z = Math.sin( -Math.PI/2 - timer) * __this.cameraRadius;

        if ( __this.lookAtScene )
            __this.camera.lookAt( __this.scene.position );

        __this.renderer.render( __this.scene, __this.camera );
    };
};
