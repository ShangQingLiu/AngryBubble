// import { mat4 } from 'gl-matrix'

// const vsSource = `
// attribute vec4 aVertexPosition;
//
// uniform mat4 uModelViewMatrix;
// uniform mat4 uProjectionMatrix;
//
// void main() {
//   gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
// }
// `
//
// const fsSource = `
// void main() {
//   gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
// }
// `

function main() {
  let canvas = document.getElementById('canvas_1')
  var gl
  var lastMouseX = null
  var lastMouseY = null
  var mouseDown = false

  var modelViewMatrix = mat4.create()
  mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -6])

  function initGL(canvas) {
    try {
      gl = canvas.getContext('webgl')
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
  }

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

  function initShaderProgram() {
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

  function initBuffers(gl) {
    // Create a buffer for the square's positions.

    const positionBuffer = gl.createBuffer()

    // Select the positionBuffer as the one to apply buffer
    // operations to from here out.

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

    // Now create an array of positions for the square.

    const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0]

    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

    return {
      position: positionBuffer
    }
  }

  function drawScene(gl, programInfo, buffers) {
    // Clear the canvas before we start drawing on it.

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display radius of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.

    const fieldOfView = 45 * Math.PI / 180 // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
    const zNear = 0.1
    const zFar = 100.0
    const projectionMatrix = mat4.create()

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar)

    // Now move the drawing position a bit to where we want to
    // start drawing the square.

    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute.
    {
      const numComponents = 2 // pull out 2 values per iteration
      const type = gl.FLOAT // the data in the buffer is 32bit floats
      const normalize = false // don't normalize
      const stride = 0 // how many bytes to get from one set of values to the next
      // 0 = use type and numComponents above
      const offset = 0 // how many bytes inside the buffer to start from
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
      gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset
      )
      gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition)
    }

    // Tell WebGL to use our program when drawing

    gl.useProgram(programInfo.program)

    // Set the shader uniforms

    gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix
    )
    gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix
    )

    {
      const offset = 0
      const vertexCount = 4
      gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount)
    }
  }

  function tick() {
    requestAnimationFrame(tick)
    drawScene(gl, programInfo, buffers)
  }

  function degToRad(deg) {
    return deg / 180 * Math.PI
  }

  function onMouseDown(event) {
    mouseDown = true
  }

  function onMouseUp(event) {
    mouseDown = false
  }

  var xAngle = 0
  var yAngle = 0
  const factor = 0.1
  function onMouseMove(event) {
    const rotateRadius = 10
    const [rotateCenterX, rotateCenterY, rotateCenterZ] = [0, 0, 0]

    if (!mouseDown) {
      return
    }
    var newX = event.clientX
    var newY = event.clientY

    if (!lastMouseX || !lastMouseY) {
      lastMouseX = newX
      lastMouseY = newY
    }

    var deltaX = newX - lastMouseX
    var deltaY = newY - lastMouseY

    var newRotationMatrix = mat4.create()

    xAngle += deltaX * factor
    yAngle += deltaY * factor

    mat4.rotate(newRotationMatrix, newRotationMatrix, degToRad(xAngle), [0, 1, 0])
    mat4.rotate(newRotationMatrix, newRotationMatrix, degToRad(yAngle), [1, 0, 0])
    let xzLength = -rotateRadius
    let cameraPosition = [xzLength * Math.sin(degToRad(-xAngle)), rotateRadius * Math.sin(degToRad(-yAngle)), xzLength * Math.cos(degToRad(-xAngle))]
    let ballPosition = [0, 0, 0]
    console.log(cameraPosition)
    mat4.translate(newRotationMatrix, newRotationMatrix, ballPosition)
    mat4.translate(newRotationMatrix, newRotationMatrix, cameraPosition)
    modelViewMatrix = newRotationMatrix

    lastMouseX = newX
    lastMouseY = newY
  }
  initGL(canvas)
  const shaderProgram = initShaderProgram()
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition')
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(
        shaderProgram,
        'uProjectionMatrix'
      ),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix')
    }
  }
  let buffers = initBuffers(gl)
  tick()
  canvas.onmousedown = onMouseDown
  document.onmouseup = onMouseUp
  document.onmousemove = onMouseMove
}



function Scene() {

}



window.onload = main

