uniform sampler2D sceneMap;
varying vec2 vUv;

uniform float width;
uniform float height;

//Ref: http://coding-experiments.blogspot.com/2010/06/edge-detection.html
float threshold(in float thr1, in float thr2 , in float val) {
 if (val < thr1) {return 0.0;}
 if (val > thr2) {return 1.0;}
 return val;
}

// averaged pixel intensity from 3 color channels
float avg_intensity(in vec4 pix) {
 return (pix.r + pix.g + pix.b)/3.;
}

vec4 get_pixel(in vec2 coords, in float dx, in float dy) {
    return texture2D(sceneMap,coords + vec2(dx, dy));
}

// returns pixel color
float IsEdge(in vec2 coords){
    float dxtex = 1.0 / width; /*image width*/
    float dytex = 1.0 / height; /*image height*/
    float pix[9];
    int k = -1;
    float delta;

    // read neighboring pixel intensities
    /*
    for (int i=-1; i<2; i++) {
        for(int j=-1; j<2; j++) {
            k++;
            pix[k] = avg_intensity(get_pixel(coords,float(i)*dxtex,
                                             float(j)*dytex));
        }
    }
    */
    pix[0] = avg_intensity(get_pixel(coords, -1.0 * dxtex, -1.0 * dytex));
    pix[1] = avg_intensity(get_pixel(coords, -1.0 * dxtex, 0.0));
    pix[2] = avg_intensity(get_pixel(coords, -1.0 * dxtex, 1.0 * dytex));
    pix[3] = avg_intensity(get_pixel(coords, 0.0, -1.0 * dytex));
    pix[4] = avg_intensity(get_pixel(coords, 0.0, 0.0));
    pix[5] = avg_intensity(get_pixel(coords, 0.0, 1.0 * dytex));
    pix[6] = avg_intensity(get_pixel(coords, 1.0 * dxtex, -1.0 * dytex));
    pix[7] = avg_intensity(get_pixel(coords, 1.0 * dxtex, 0.0));
    pix[8] = avg_intensity(get_pixel(coords, 1.0 * dxtex, 1.0 * dytex));

    // average color differences around neighboring pixels
    delta = (abs(pix[1]-pix[7])+
             abs(pix[5]-pix[3]) +
             abs(pix[0]-pix[8])+
             abs(pix[2]-pix[6])
            )/4.;

    return threshold(0.25,0.4,clamp(1.8*delta,0.0,1.0));
}

void main() {
    //vec4 color = texture2D( sceneMap, vUv );
    //gl_FragColor = vec4( color.r, color.g, color.b, 1.0 );

    vec4 color = vec4(0.0,0.0,0.0,1.0);
    color.g = IsEdge(vUv);
    gl_FragColor = color;
}
