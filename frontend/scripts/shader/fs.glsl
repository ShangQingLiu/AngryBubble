#ifdef GL_ES
precision mediump float;
#endif


uniform vec3 fsAmbientLight;
uniform vec3 fsKa;

varying vec4 vertexPosition;
varying vec3 normal;



void main() {

    vec3 ambient = fsAmbientLight * fsKa;
    gl_FragColor = vec4(ambient, 1.0);
}