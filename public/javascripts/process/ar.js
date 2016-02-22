var createARCanvas = function( p ) {
    p.setup = function() {
        var c = p.createCanvas(windowWidth, CanvasConfig.height);
        c.id("arCanvas");
        c.position(0, CanvasConfig.position.y);
        //p.background('rgba(0, 255, 0, 0.2)');
        p.noLoop();
    };

    p.draw = function() {
    };
};
