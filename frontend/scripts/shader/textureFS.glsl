#ifdef GL_ES
precision mediump float;
#endif

uniform vec4 fsKa;

uniform sampler2D fsSampler;

varying vec2 texCoord;

void main() {
    vec4 tempColor = texture2D(fsSampler, texCoord);
    gl_FragColor = fsKa *tempColor;
}