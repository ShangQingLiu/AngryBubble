const socket = io()

let users = []
let currentUser

document.querySelector('#input').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    document.getElementById('login').style.visibility = 'hidden'
    socket.emit('enter', event.target.value)
    event.target.value = ''
  }
})

window.addEventListener('keydown', onKeyDown, false)

socket.on('welcome', initUsers)

socket.on('update', updateUser)

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
  console.log(currentUser)
  animate()
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

function updateUser(allUsers) {
  console.log('update user')
  users = allUsers
}
