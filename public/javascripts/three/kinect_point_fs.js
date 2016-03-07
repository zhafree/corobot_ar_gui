uniform sampler2D rgbMap;

varying vec2 vUv;

void main() {
    vec4 color = texture2D( rgbMap, vUv );
    gl_FragColor = vec4( color.r, color.g, color.b, 0.6 );
}
