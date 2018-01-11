const objVsSrouce = `
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTextureCoord;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uNormalMatrix;

varying vec4 vertexPosition;
varying vec3 normal;
varying vec2 textureCoord;

void main() {
    normal = vec3(uNormalMatrix * vec4(aNormal, 1.0));
    vertexPosition = uModelMatrix * vec4(aPosition, 1.0);
    gl_Position = uProjectionMatrix * uViewMatrix * vertexPosition;
    textureCoord = aTextureCoord;
}

`;

const objFsSource = `
#ifdef GL_ES
precision mediump float;
#endif


uniform vec3 uPointLightingLocation;
uniform vec3 uPointLightColor;

uniform vec3 uDirectionalLightDirection;
uniform vec3 uDirectionalLightColor;



uniform vec3 uAmbientLightColor;

uniform vec3 uKa;
uniform vec3 uKd;
uniform vec3 uKs;
uniform float uNs;

uniform sampler2D uSampler;

varying vec4 vertexPosition;
varying vec3 normal;
varying vec2 textureCoord;


void main() {
    vec3 vertexNormal = normalize(normal);
    vec3 pointLightDirection = normalize(uPointLightingLocation - vertexPosition.xyz);
    vec3 directionalLightDirection = normalize(uDirectionalLightDirection);
    vec4 textureColor = texture2D(uSampler, textureCoord);

    vec4 color = vec4(0.0, 0.0, 0.0, 1.0);

    vec4 ambient = vec4(uAmbientLightColor*uKa, 1.0);
    
    color = color + ambient;

    float diffuseFactor = dot(-pointLightDirection, vertexNormal);
    vec4 diffuse = vec4(0.0, 0.0, 0.0, 1.0);
    if ( diffuseFactor > 0.0 ) {
        diffuse = diffuseFactor*vec4(uPointLightColor*uKd*textureColor.xyz, 1.0);
    }  
    color = color + diffuse;
    
    diffuseFactor = dot(-directionalLightDirection, vertexNormal);
    diffuse = vec4(0.0, 0.0, 0.0, 1.0);
    if ( diffuseFactor > 0.0 ) {
        diffuse = diffuseFactor*vec4(uDirectionalLightColor*uKd*textureColor.xyz, 1.0);
    } 
    color = color + diffuse;

    vec3 cameraPos = uPointLightingLocation;

    vec4 specular = vec4(0.0, 0.0, 0.0, 1.0);
    vec3 reflectLightDir = reflect(pointLightDirection, vertexNormal);  
    reflectLightDir= normalize(reflectLightDir);  
    vec3 vertexToCamera = cameraPos - vertexPosition.xyz;  
    vertexToCamera= normalize(vertexToCamera);  
    float specularFactor = dot(vertexToCamera, reflectLightDir);
    if (specularFactor > 0.0) {
        specularFactor = pow(specularFactor, uNs);
        specular = specularFactor*vec4(uPointLightColor, 1.0)*vec4(uKs, 1.0);
    }
    color = color + specular;

    specular = vec4(0.0, 0.0, 0.0, 1.0);
    reflectLightDir = reflect(directionalLightDirection, vertexNormal);
    reflectLightDir= normalize(reflectLightDir);  
    specularFactor = dot(vertexToCamera, reflectLightDir);
    if (specularFactor > 0.0) {
        specularFactor = pow (specularFactor, uNs);
        specular = specularFactor*vec4(uDirectionalLightColor, 1.0)*vec4(uKs, 1.0);
    }
    color = color + specular;
    gl_FragColor = clamp(color, 0.0, 1.0);
}

`;












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

uniform float lightFactor;

varying vec4 vertexPosition;
varying vec3 normal;

varying vec3 vLightWeighting;
varying vec3 lightDirection;

void main() {
    float pointLight = dot(normal, lightDirection);
    vec3 ambient = fsAmbientLight * vec3(fsKa);
    vec3 lightened = (ambient + pointLight) * lightFactor * fsKa.a;
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
        let gl=this.gl;
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA)
        if (users.length > this.userBalls.length) {
            let deta = foods.length - this.foodBalls.length
            for (let i = 0; i != deta; ++i) {
                this.foodBalls.push(new Ball(this.gl, this.shaderProgram, 4))
            }

            deta = users.length - this.userBalls.length
            for (let i = 0; i != deta; ++i) {
                this.userBalls.push(new Ball(this.gl, this.shaderProgram, 4))
            }
        }

        for (let i = 0; i != foods.length; ++i) {
            this.foodBalls[i].setPosition(foods[i].pos.x, foods[i].pos.y, foods[i].pos.z)
            this.foodBalls[i].setRadius(foods[i].radius)
            this.foodBalls[i].setColor(foods[i].color)
        }

        for (let i = 0; i != users.length; ++i) {
            this.userBalls[i].setPosition(users[i].pos.x, users[i].pos.y, users[i].pos.z)
            this.userBalls[i].setRadius(users[i].radius);
            this.userBalls[i].setUserColor();
        }

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        setViewMatrix()
        setLight()

        gl.useProgram(this.shaderProgram)

        gl.uniformMatrix4fv(this.vsViewMatrix, false, viewMatrix.elements)
        gl.uniformMatrix4fv(this.vsProjectionMatrix, false, projectionMatrix.elements)
        gl.uniform3f(this.uPointLightingLocation, currentUser.pos.x + 0.01, currentUser.pos.y + 0.01, currentUser.pos.z + 0.01)
        gl.uniform1f(this.lightFactor, lightIndensity)


        gl.useProgram(this.objShaderProgram);

        let uPointLightingLocationObj = gl.getUniformLocation(this.objShaderProgram, "uPointLightingLocation");
        let uPointLightColorObj = gl.getUniformLocation(this.objShaderProgram, "uPointLightColor");
        let uDirectionalLightDirectionObj = gl.getUniformLocation(this.objShaderProgram, "uDirectionalLightDirection");
        let uDirectionalLightColorObj = gl.getUniformLocation(this.objShaderProgram, "uDirectionalLightColor");
        let uAmbientLightColorObj = gl.getUniformLocation(this.objShaderProgram, "uAmbientLightColor");

        gl.uniform3f(uPointLightingLocationObj,  currentUser.pos.x + 0.01, currentUser.pos.y + 0.01, currentUser.pos.z + 0.01);
        gl.uniform3f(uPointLightColorObj, 0.4, 0.4, 0.4);
        gl.uniform3f(uDirectionalLightDirectionObj, 0.5, 0.5, 0.5);
        gl.uniform3f(uDirectionalLightColorObj, 0.4, 0.4, 0.4);
        gl.uniform3f(uAmbientLightColorObj, 0.4, 0.4, 0.4);


        this.rock.draw(viewMatrix, projectionMatrix);


        this.textureBorder.draw(viewMatrix, projectionMatrix)
        for (let i = 0; i != foods.length; ++i) {
            this.foodBalls[i].draw(viewMatrix, projectionMatrix)
        }
        gl.depthMask(true);
        for (var i = 0; i != users.length; ++i) {
            this.userBalls[i].draw(viewMatrix, projectionMatrix)
        }


        gl.depthMask(true);


    }

    try {
        this.gl = _canvas.getContext('webgl', {preserveDrawingBuffer: true})
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
    this.objShaderProgram = initShaderProgram(gl, objVsSrouce, objFsSource);
    this.fsAmbientLight = gl.getUniformLocation(this.shaderProgram, 'fsAmbientLight')
    this.vsViewMatrix = gl.getUniformLocation(this.shaderProgram, 'vsViewMatrix')
    this.vsProjectionMatrix = gl.getUniformLocation(this.shaderProgram, 'vsProjectionMatrix')
    this.uPointLightingLocation = gl.getUniformLocation(this.shaderProgram, 'uPointLightingLocation')
    this.lightFactor = gl.getUniformLocation(this.shaderProgram, 'lightFactor')



    gl.useProgram(this.shaderProgram)
    gl.uniform3f(this.fsAmbientLight, 0.6, 0.6, 0.6)

    //const fieldOfView = 45 * Math.PI / 180; // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
    const zNear = 0.01
    const zFar = 100.0

    //perspectiveMatrix = new Matrix4();
    projectionMatrix.setPerspective(45.0, aspect, zNear, zFar)

    this.textureBorder = new TextureBorder(20, './scripts/resources/background.jpg', gl, this.textureShaderProgram)
    this.userBalls = []
    this.rocks = [];
    this.rock = new ObjObject('./scripts/resources/Rock.obj', gl, this.objShaderProgram);
    this.foodBalls = []

    this.canvas.onmousedown = onMouseDown
    document.onmouseup = onMouseUp
    document.onmousemove = onMouseMove
    document.onmousewheel = onMouseWheel;
    sceneHndle = this
    sceneInitReady = true
}

let mouseDown = false
let lastMouseX = null, lastMouseY = null, horizontalAngle = 0, verticalAngle = 0
var sceneHndle = null
const CAMERA_MOVE_FACTOR = 0.01
let viewDistance = 6

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

    horizontalAngle += deltaX * CAMERA_MOVE_FACTOR
    verticalAngle += deltaY * CAMERA_MOVE_FACTOR

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

const wheelFactor = 0.05
function onMouseWheel(e) {
    let deltaY = e.deltaY * wheelFactor
    viewDistance -= deltaY
    if (viewDistance < 5) {
        viewDistance = 5
    } else if (viewDistance > 10) {
        viewDistance = 10
    }
}

function setLight() {

}

function setViewMatrix() {
    let rotateRadius = viewDistance
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
    return {
        x: ballPosition.x + Math.cos(verticalAngle) * Math.sin(horizontalAngle) * STEP * speed,
        y: ballPosition.y + (-Math.sin(verticalAngle)) * STEP * speed,
        z: ballPosition.z + (-Math.cos(verticalAngle)) * Math.cos(horizontalAngle) * STEP * speed
    }
}

function increaseFactor() {
    CAMERA_MOVE_FACTOR += STEP
}

function decreaseFactor() {
    CAMERA_MOVE_FACTOR -= STEP
}

var lightIndensity = 1
function setLightIndensity(l) {
    if (l > 0) {
        lightIndensity = l
    }
}

