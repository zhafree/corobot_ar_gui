uniform sampler2D rgbMap;
uniform vec4 colorMode;

varying vec2 vUv;

void main() {
    vec4 color = texture2D( rgbMap, vUv );

    if (colorMode.w < 0.1)
        gl_FragColor = vec4( color.r, color.g, color.b, 0.5 );
    else
        gl_FragColor = colorMode;
}
