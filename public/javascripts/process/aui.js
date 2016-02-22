var createAUICanvas = function( p ) {
    p.setup = function() {
        var c = p.createCanvas(windowWidth, windowHeight);
        c.id("auiCanvas");
        c.position(0, 0);
        //p.background('rgba(0, 0, 255, 0.2)');
        p.noLoop();
    };

    p.draw = function() {
    };
};
