const socket = io()

let users = []
let foods = []
let currentUser
const canvas = document.getElementById('main')
canvas.height = window.innerHeight
canvas.width = window.innerWidth

document.querySelector('#input').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    document.getElementById('cover').style.visibility = 'hidden'
    socket.emit('enter', event.target.value)
    event.target.value = ''
  }
})

document.addEventListener('keydown', onKeyDown, true)

socket.on('welcome', init)

socket.on('update', update)

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
  // update(users)
  console.log(currentUser)
  console.log(tmpUser)
  socket.emit('move', tmpUser)
}

function init(args) {
  // users = allUsers
  users = args.users
  foods = args.foods
  console.log(foods)
  let index
  if ((index = users.findIndex((val) => val.id === socket.id)) !== -1)
    currentUser = users[index]
  console.log(currentUser)
  animate()
}

function update(args) {
  console.log('update user')
  users = args.users
  foods = args.foods
  let index
  if ((index = users.findIndex((val) => val.id === socket.id)) !== -1)
    currentUser = users[index]
  console.log(currentUser)
}
