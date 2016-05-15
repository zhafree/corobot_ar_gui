uniform sampler2D depthMap;
uniform float width;
uniform float height;
uniform float nearClipping, farClipping;

uniform float depthScale;
uniform float depthClipping;

uniform float modelScale;
uniform float modelTransZ;

uniform float pointSize;

varying vec2 vUv;

const float XtoZ = 1.11146; // tan( 58 / 2.0 ) * 2.0;
const float YtoZ = 0.83359; // tan( 45 / 2.0 ) * 2.0;

//varying float depth;

void main() {
    vUv = vec2( 1.0 - position.x / width, position.y / height );

    vec4 color = texture2D( depthMap, vUv );

    float depth = 1.0 - ( color.r + color.g + color.b ) / 3.0;
    //depth = 1.0;
    depth = depth * depthScale;
    // Cut the near noise
    // -0.01 for less noise
    if (depth >= depthClipping - 0.01)
        depth = 1000.0;

    float z = depth * (farClipping - nearClipping) + nearClipping;

    vec4 pos = vec4(
        ( position.x / width - 0.5 ) * z * XtoZ * modelScale,
        ( position.y / height - 0.5 ) * z * YtoZ * modelScale,
        -z + modelTransZ,
        1.0);

    gl_PointSize = pointSize;
    gl_Position = projectionMatrix * modelViewMatrix * pos;
}
