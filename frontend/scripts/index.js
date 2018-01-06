const socket = io()

let users = []
let currentUser
const canvas = document.getElementById('main')

document.querySelector('#input').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    document.getElementById('login').style.visibility = 'hidden'
    socket.emit('enter', event.target.value)
    event.target.value = ''
  }
})

document.addEventListener('keydown', onKeyDown, true)

socket.on('welcome', initUsers)

socket.on('update', updateUser)

function onKeyDown(event) {
  console.log('key: ' + event.key)
  const tmpUser = JSON.parse(JSON.stringify(currentUser))
  switch (event.key) {
    case 'w':
      tmpUser.pos.y += 0.1
      break
    case 's':
      tmpUser.pos.y -= 0.1
      break
    case 'a':
      tmpUser.pos.x -= 0.1
      break
    case 'd':
      tmpUser.pos.x += 0.1
      break
    default:
      break
  }
  // updateUser(users)
  console.log(currentUser)
  console.log(tmpUser)
  socket.emit('move', tmpUser)
}

function initUsers(allUsers) {
  users = allUsers
  let index
  if ((index = users.findIndex((val) => val.id === socket.id)) !== -1)
    currentUser = users[index]
  console.log(currentUser)
  animate()
}

function updateUser(allUsers) {
  console.log('update user')
  users = allUsers
  let index
  if ((index = users.findIndex((val) => val.id === socket.id)) !== -1)
    currentUser = users[index]
  console.log(currentUser)
}
