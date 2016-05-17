uniform sampler2D sceneMap;
uniform sampler2D edgeMap;

varying vec2 vUv;

uniform float width;
uniform float height;

void main() {
    vec4 color = texture2D( sceneMap, vUv );
    vec4 color2 = texture2D( edgeMap, vUv );
    gl_FragColor = vec4( color.r, color.g + color2.g, color.b, 1.0 );
}
