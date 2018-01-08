/*
let users = [];
function UserInfo(_id) {
    this.id = _id;
    this.name = _id;
    this.pos = {
        x: Math.random()*100 - 50,
        y: Math.random()*100 - 50,
        z: Math.random()*100 - 50
    };
    this.radius = Math.random()*3 + 5;
}

let balls = [];


for(var i = 0; i != 10; ++i){
    users.push(new UserInfo(i));
}
*/

// let currentUser = users[0]
// currentUser.radius = 5;
// currentUser.pos.x = 5;
// currentUser.pos.y = 5;
// currentUser.pos.z = 5;

const vsSource = `
attribute vec3 vsPosition;
attribute vec3 vsNormal;

uniform mat4 vsProjectionMatrix;
uniform mat4 vsViewMatrix;
uniform mat4 vsModelMatrix;
uniform mat4 vsNormalMatrix;

varying vec4 vertexPosition;
varying vec3 normal;

uniform vec3 uPointLightingLocation;

varying vec3 lightDirection;

void main() {
    normal = normalize(vec3(vsNormalMatrix * vec4(vsNormal, 1.0)));
    vertexPosition = vsModelMatrix * vec4(vsPosition, 1.0);
    lightDirection = normalize(uPointLightingLocation - vertexPosition.xyz);
    gl_Position = vsProjectionMatrix * vsViewMatrix * vertexPosition;
}
`

const fsSource = `
#ifdef GL_ES
precision mediump float;
#endif

uniform vec3 fsAmbientLight;
uniform vec4 fsKa;

varying vec4 vertexPosition;
varying vec3 normal;

varying vec3 vLightWeighting;
varying vec3 lightDirection;

void main() {
    float pointLight = dot(normal, lightDirection);
    vec3 ambient = fsAmbientLight * vec3(fsKa);
    vec3 lightened = ambient * pointLight;
    gl_FragColor = vec4(lightened, fsKa.a);
}
`
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

`
const textureVsSource = `
attribute vec3 vsPosition;
attribute vec2 vsTexCoord;

uniform mat4 vsMvpMatrix;

varying vec2 texCoord;

void main() {
    gl_Position = vsMvpMatrix * vec4(vsPosition, 1.0);

    texCoord = vsTexCoord;

}
`

let projectionMatrix = new Matrix4()
let viewMatrix = new Matrix4()

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
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource)
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource)

  // Create the shader program

  const shaderProgram = gl.createProgram()
  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)
  gl.linkProgram(shaderProgram)

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(
      'Unable to initialize the shader program: ' +
      gl.getProgramInfoLog(shaderProgram)
    )
    return null
  }

  return shaderProgram
}

let sceneInitReady = false

function Scene(_canvas) {
  this.canvas = _canvas
  if (!this.canvas) {
    console.log('Failed to get canvas')
    return
  }

  this.gl = null
  this.objects = []
  this.fsAmbientLight = null
  let gl

  this.draw = function () {

    if (users.length > this.userBalls.length) {
      let deta = users.length - this.userBalls.length
      for (let i = 0; i != deta; ++i) {
          this.userBalls.push(new Ball(this.gl, this.shaderProgram, 4))
      }
      deta = foods.length - this.foodBalls.length;
      for (let i = 0; i != deta; ++i) {
          this.foodBalls.push(new Ball(this.gl, this.shaderProgram, 1));
      }

    }
    for (let i = 0; i != users.length; ++i) {
      this.userBalls[i].setPosition(users[i].pos.x, users[i].pos.y, users[i].pos.z)
      this.userBalls[i].setRadius(users[i].radius)
    }

    for (let i = 0; i != foods.length; ++i){
        this.foodBalls[i].setPosition(foods[i].pos.x, foods[i].pos.y, foods[i].pos.z)
        this.foodBalls[i].setRadius(foods[i].radius)
        this.foodBalls[i].setColor(foods[i].color)
    }

    var gl = this.gl
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.enable(gl.DEPTH_TEST)
    setViewMatrix()
    setLight()

    gl.useProgram(this.shaderProgram)

    gl.uniformMatrix4fv(this.vsViewMatrix, false, viewMatrix.elements);
    gl.uniformMatrix4fv(this.vsProjectionMatrix, false, projectionMatrix.elements);
    gl.uniform3f(this.uPointLightingLocation, currentUser.pos.x + 1, currentUser.pos.y + 1, currentUser.pos.z + 1);

    for (var i = 0; i != users.length; ++i) {
      this.userBalls[i].draw(viewMatrix, projectionMatrix)
    }
    for( let i = 0; i != foods.length; ++i){
      this.foodBalls[i].draw(viewMatrix, projectionMatrix);
    }

    this.textureBorder.draw(viewMatrix, projectionMatrix)
  }

  try {
    this.gl = _canvas.getContext('webgl')
    gl = this.gl
    var canvas = _canvas
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

  this.shaderProgram = initShaderProgram(gl, vsSource, fsSource)
  this.textureShaderProgram = initShaderProgram(gl, textureVsSource, textureFsSource)
  this.fsAmbientLight = gl.getUniformLocation(this.shaderProgram, 'fsAmbientLight')
  this.vsViewMatrix = gl.getUniformLocation(this.shaderProgram, 'vsViewMatrix')
  this.vsProjectionMatrix = gl.getUniformLocation(this.shaderProgram, 'vsProjectionMatrix')
  this.uPointLightingLocation = gl.getUniformLocation(this.shaderProgram, 'uPointLightingLocation')

  gl.useProgram(this.shaderProgram)
  gl.uniform3f(this.fsAmbientLight, 0.6, 0.6, 0.6)

  //const fieldOfView = 45 * Math.PI / 180; // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
  const zNear = 0.01
  const zFar = 100.0

  //perspectiveMatrix = new Matrix4();
  projectionMatrix.setPerspective(45.0, aspect, zNear, zFar)

  this.textureBorder = new TextureBorder(20, './scripts/resources/background.jpg', gl, this.textureShaderProgram)
  this.userBalls = [];
  this.foodBalls = [];

  this.canvas.onmousedown = onMouseDown
  document.onmouseup = onMouseUp
  document.onmousemove = onMouseMove
  sceneHndle = this
  sceneInitReady = true
}

let mouseDown = false
let lastMouseX = null, lastMouseY = null, horizontalAngle = 0, verticalAngle = 0
var sceneHndle = null
const factor = 0.001

function degToRad(deg) {
  return deg / 180 * Math.PI
}

function onMouseDown(event) {
  mouseDown = true
}

function onMouseUp(event) {
  mouseDown = false
}

function onMouseMove(event) {

  var newX = event.clientX
  var newY = event.clientY

  if (!lastMouseX || !lastMouseY) {
    lastMouseX = newX
    lastMouseY = newY
  }

  var deltaX = newX - lastMouseX
  var deltaY = newY - lastMouseY

  horizontalAngle += deltaX * factor
  verticalAngle += deltaY * factor

  if (verticalAngle < -Math.PI / 2) {
    verticalAngle = -Math.PI / 2
  }
  if (verticalAngle > Math.PI / 2) {
    verticalAngle = Math.PI / 2
  }

  setViewMatrix()

  lastMouseX = newX
  lastMouseY = newY
  console.log('update view')

}

function setLight() {

}

let scaleFactor = 6
function setViewMatrix() {
  let rotateRadius = currentUser.radius * scaleFactor
  let direction = [
    -Math.cos(verticalAngle) * Math.sin(horizontalAngle) * rotateRadius,
    Math.sin(verticalAngle) * rotateRadius,
    Math.cos(verticalAngle) * Math.cos(horizontalAngle) * rotateRadius
  ]

  let ballPosition = currentUser.pos
  viewMatrix.setLookAt(
    ballPosition.x + direction[0], 
    ballPosition.y + direction[1], 
    ballPosition.z + direction[2], 
    ballPosition.x, 
    ballPosition.y, 
    ballPosition.z, 
    0, 1, 0)
}

const STEP = 0.1
function nextPositionToward(speed) {
  let ballPosition = currentUser.pos
  return {x: ballPosition.x + Math.cos(verticalAngle) * Math.sin(horizontalAngle) * STEP * speed, 
          y: ballPosition.y + (-Math.sin(verticalAngle)) * STEP * speed, 
          z: ballPosition.z + (-Math.cos(verticalAngle)) * Math.cos(horizontalAngle) * STEP * speed}
}

function increaseFactor() {
  factor += STEP
}

function decreaseFactor() {
  factor -= STEP
}
