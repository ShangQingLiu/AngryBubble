const socket = io()

let users = []
let currentUser

document.querySelector('#input').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    console.log('hide')
    document.getElementById('login').style.visibility = 'hidden'
    socket.emit('enter', event.target.value)
    event.target.value = ''
  }
})

window.addEventListener('keydown', onKeyDown, false)

socket.on('welcome', initUsers)

socket.on('new user enter', addUser)

socket.on('a user move', updateUser)

function onKeyDown() {
  console.log('key: ' + event.key)
  switch (event.key) {
    case 'w':
      currentUser.pos.y += 0.1
      break
    case 's':
      currentUser.pos.y -= 0.1
      break
    case 'a':
      currentUser.pos.x -= 0.1
      break
    case 'd':
      currentUser.pos.x += 0.1
      break
    default:
      break
  }
  updateUser(currentUser)
  socket.emit('move', currentUser)
}

function initUsers(allUsers) {
  users = allUsers
  let index
  if ((index = users.findIndex((val) => val.id === socket.id)) !== -1)
    currentUser = users[index]
  drawObjects()
  renderUsers()
}

function addUser(user) {
  console.log('add user')
  let index
  if ((index = users.findIndex((val) => val.id === user.id)) !== -1)
    users[index] = user
  else
    users.push(user)
  addBall(user)
}

function updateUser(user) {
  console.log('update user')
  const ball = scene.getObjectByName(user.name)
  ball.position.set(user.pos.x, user.pos.y, user.pos.z)
}

function addBall(ballVal) {
  const ballGeometry = new THREE.SphereGeometry(1, 12, 12)
  const basicMtl = new THREE.MeshBasicMaterial({color: 0x00ff00, wireframe: true})
  const ball = new THREE.Mesh(ballGeometry, basicMtl)
  ball.scale.set(ballVal.radius, ballVal.radius, ballVal.radius)
  ball.position.set(ballVal.pos.x, ballVal.pos.y, ballVal.pos.z)
  ball.name = ballVal.name
  scene.add(ball)
}

function renderUsers() {
  users.forEach((val) => {addBall(val)})
  const usersArea = document.querySelector('#users')
  usersArea.innerHTML = ''
  users.forEach((val) => {
    const p = document.createElement('p')
    p.innerHTML = `name: ${val.name}; pos: ${val.pos.x} ${val.pos.y} ${val.pos.z}; size: ${val.radius}`
    usersArea.appendChild(p)
  })
}