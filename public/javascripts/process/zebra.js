// Intergrate Zebra UI
var createZebraCanvas = function( p ) {

    var zebraCanvas;
    p.setup = function() {
        zebraCanvas = p.createCanvas(352, CanvasConfig.height);
        zebraCanvas.id("GUICanvas");
        zebraCanvas.position(0, CanvasConfig.position.y/2);
        //p.background('rgba(0, 255, 0, 0.2)');
        p.noLoop();
    };

    p.draw = function() {
    };
};
