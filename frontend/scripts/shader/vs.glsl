attribute vec3 vsPosition;
attribute vec3 vsNormal;
uniform mat4 vsMvpMatrix;
uniform mat4 vsModelMatrix;
uniform mat4 vsNormalMatrix;


varying vec4 vertexPosition;
varying vec3 normal;


void main() {
    normal = normalize(vec3(vsNormalMatrix * vec4(vsNormal, 1.0)));
    vertexPosition = vsModelMatrix * vec4(vsPosition, 1.0);

    gl_Position = vsMvpMatrix * vec4(vsPosition, 1.0);

}