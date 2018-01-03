const WINDOW_WIDTH = 800
const WINDOW_HEIGHT = 600

const scene = new Scene(canvas)

/*
const renderer = new THREE.WebGLRenderer({antialias: true})
renderer.setRadius(WINDOW_WIDTH, WINDOW_HEIGHT)
document.querySelector('#main').appendChild(renderer.domElement)

const scene = new THREE.Scene()

const cameraPos = new THREE.Spherical(10, Math.PI / 2, 0)
*/

/*
function drawObjects() {
  scene.draw()
  const cubeGEometry = new THREE.BoxGeometry(1, 1, 1)
  const basicMtl = new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true})
  const cube1 = new THREE.Mesh(cubeGEometry, basicMtl)
  cube1.position.set(-1, -1, -1)
  const cube2 = new THREE.Mesh(cubeGEometry, basicMtl)
  cube2.position.set(1, 3, -1)
  const cube3 = new THREE.Mesh(cubeGEometry, basicMtl)
  cube3.position.set(-1, -1, 2)
  const cube4 = new THREE.Mesh(cubeGEometry, basicMtl)
  cube4.position.set(3, 1, -1)

  const ballGeometry = new THREE.SphereGeometry(1, 12, 12)
  const Ball = new THREE.Mesh(ballGeometry, basicMtl)
  Ball.scale.set(0.5, 0.5, 0.5)
  Ball.position.set(0, 0, 0)
  Ball.name = 'Ball'
  scene.add(Ball)
  scene.add(cube1)
  scene.add(cube2)
  scene.add(cube3)
  scene.add(cube4)
}
  */

// const camera = initCamera()

// drawObjects()

/*
function initCamera() {
  const camera = new THREE.PerspectiveCamera(45, WINDOW_WIDTH / WINDOW_HEIGHT, 0.1, 1000)
  camera.position.set(12, 16, 20)
  // camera.position.setFromSpherical(cameraPos)
  // camera.position.set(camera.position.x + 10, camera.position.y, camera.position.z)
  camera.up.set(0, 1, 0)
  camera.lookAt(new THREE.Vector3(0, 0, 0))
  // camera.lookAt(scene.getObjectByName('Ball').position)
  return camera
}
*/

// animate()

function animate() {
  requestAnimationFrame(animate)
  scene.draw()
}
