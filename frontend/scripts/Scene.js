


let users = [];
function UserInfo(_id) {
    this.id = _id;
    this.name = _id;
    this.pos = {
        x: Math.random(),
        y: Math.random(),
        z: Math.random()
    };
    this.size = Math.random()
}

let balls = [];


for(var i = 1000; i != 1005; ++i){
    users.push(new UserInfo(i));
}

let currentUser = users[0];
currentUser.pos.x = 0;
currentUser.pos.y = 0;
currentUser.pos.z = 0;
















const vsSource = `
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
`;

const fsSource = `
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
`;
const textureFsSource = `
#ifdef GL_ES
precision mediump float;
#endif

uniform vec4 fsKa;

uniform sampler2D fsSampler;

varying vec2 texCoord;

void main() {
    vec4 tempColor = texture2D(fsSampler, texCoord);
    gl_FragColor = tempColor*fsKa;
}

`;
const textureVsSource = `
attribute vec3 vsPosition;
attribute vec2 vsTexCoord;

uniform mat4 vsMvpMatrix;

varying vec2 texCoord;

void main() {
    gl_Position = vsMvpMatrix * vec4(vsPosition, 1.0);

    texCoord = vsTexCoord;

}
`;

let perspectiveMatrix = new Matrix4();
let vpMatrix = new Matrix4();


function loadShader(gl, type, source) {
    const shader = gl.createShader(type)

    // Send the source to the shader object

    gl.shaderSource(shader, source)

    // Compile the shader program

    gl.compileShader(shader)

    // See if it compiled successfully

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(
            'An error occurred compiling the shaders: ' +
            gl.getShaderInfoLog(shader)
        )
        gl.deleteShader(shader)
        return null
    }
    return shader
}

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(
            'Unable to initialize the shader program: ' +
            gl.getProgramInfoLog(shaderProgram)
        )
        return null;
    }

    return shaderProgram;
}

let sceneInitReady = false;


function Scene(_canvas) {
    this.canvas = _canvas;
    if(!this.canvas){
        console.log("Failed to get canvas");
        return;
    };
    this.gl = null;
    this.objects = [];
    this.textureShaderInfo = null;
    //var modelViewMatrix = mat4.create()
    //mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -6])
    var gl;

    this.draw = function () {

        if(users.length > balls.length){
            for(let i = 0; i != users.length - balls.length; ++i){
                // add balls
            }
        }
        for(let i = 0; i != users.length; ++i){
            // balls[i].setPosition()  // set positions
        }

        if(this.gl == null ){
            console.log("gl is null")
            console.log(this)
            //return;
        }

        var gl = this.gl;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        setVpMatrix();
        //console.log(vpMatrix)
        this.textureBorder.draw(vpMatrix);
        for(var i = 0; i != users.length; ++i){
            //balls[i].draw(this.vpMatrix);
        }

    }

    this.factor = 0.1;

    try {
        this.gl = _canvas.getContext('webgl');
        gl = this.gl;
        var canvas = _canvas;
        gl.viewportWidth = canvas.width
        gl.viewportHeight = canvas.height
        gl.clearColor(0.0, 0.0, 0.0, 1.0) // Clear to black, fully opaque
        gl.clearDepth(1.0) // Clear everything
        gl.enable(gl.DEPTH_TEST) // Enable depth testing
        gl.depthFunc(gl.LEQUAL) // Near things obscure far things
    } catch (e) {
        if (!gl) {
            alert('unable to start WebGL')
        }
        console.error(e)
    }

    //const shaderProgram = initShaderProgram(vsSource, fsSource);
    const textureShaderProgram = initShaderProgram(gl, textureVsSource, textureFsSource);
    //this.shaderInfo = {
    //    program: shaderProgram
    //};
    this.textureShaderInfo = {
        program:textureShaderProgram
    };

    const fieldOfView = 45 * Math.PI / 180; // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 2000.0;

    //perspectiveMatrix = new Matrix4();
    perspectiveMatrix.perspective(fieldOfView, aspect, zNear, zFar);

    this.textureBorder = new TextureBorder(5,'./scripts/resources/earth.jpg',gl,this.textureShaderInfo.program );
    this.balls = [];

    // let buffers = initBuffers(gl)
    // tick()


    //const perspectiveMatrix = new Matrix4();

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    //mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar)


    this.canvas.onmousedown = onMouseDown
    document.onmouseup = onMouseUp
    document.onmousemove = onMouseMove;
    sceneHndle = this;
    sceneInitReady = true;
}

let mouseDown = false
let lastMouseX = null, lastMouseY = null, xAngle = 0, yAngle = 0;
var sceneHndle = null;

function degToRad(deg) {
    return deg / 180 * Math.PI
}

function onMouseDown(event) {
    mouseDown = true;
}

function onMouseUp(event) {
    mouseDown = false;
}

function onMouseMove(event) {

    const rotateRadius = 10;
    const [rotateCenterX, rotateCenterY, rotateCenterZ] = [0, 0, 0];
    const factor = 0.1;

    var newX = event.clientX;
    var newY = event.clientY;

    if (!lastMouseX || !lastMouseY) {
        lastMouseX = newX;
        lastMouseY = newY;
    }


    var deltaX = newX - lastMouseX;
    var deltaY = newY - lastMouseY;


    xAngle += deltaX * factor;
    yAngle += deltaY * factor;

    setVpMatrix();



    lastMouseX = newX;
    lastMouseY = newY;
    console.log("update view")

}

function setVpMatrix(){
    let rotateRadius = 1000;
    let xzLength = -rotateRadius;
    let cameraPosition = [xzLength * Math.sin(degToRad(-xAngle)), rotateRadius * Math.sin(degToRad(-yAngle)), xzLength * Math.cos(degToRad(-xAngle))]
    let ballPosition = currentUser.pos;
    vpMatrix.set(perspectiveMatrix);
    vpMatrix.lookAt(cameraPosition[0],cameraPosition[1],cameraPosition[2],ballPosition.x,ballPosition.y,ballPosition.z, 0, 1, 0);
}

