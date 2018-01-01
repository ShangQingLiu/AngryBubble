attribute vec3 vsPosition;
attribute vec2 vsTexCoord;

uniform mat4 vsMvpMatrix;

varying vec2 texCoord;

void main() {
    gl_Position = vsMvpMatrix * vec4(vsPosition, 1.0);

    texCoord = vsTexCoord;

}