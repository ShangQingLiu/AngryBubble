#ifdef GL_ES
precision mediump float;
#endif

uniform vec3 vsLightColor;
uniform vec3 vsLightPosition;
uniform vec3 vsAmbientLight;
uniform vec3 vsKa;
uniform vec3 vsKd;
uniform vec3 vsKs;


varying vec4 vertexPosition;
varying vec3 normal;



void main() {

    vec3 lightDirection = normalize(vsLightPosition - vec3(vertexPosition));
    float nDotL = max(dot(lightDirection, normal), 0.0);
    vec3 diffuse = vsLightColor * vsKd * nDotL;
    vec3 ambient = vsAmbientLight * vsKa;
    gl_FragColor = vec4(diffuse + ambient, 1.0);
}