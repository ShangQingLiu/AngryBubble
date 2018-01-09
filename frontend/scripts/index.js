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

document.querySelector('#save').addEventListener('click', (event) => {
  event.preventDefault()
  // const image = canvas.toDataURL()
  // console.log(image)
  // document.write(`<img src="${image}"/>`)
  // window.open().location = image
  const image = document.getElementById('main').toDataURL('image/png').replace('image/png', 'image/octet-stream') //Convert image to 'octet-stream' (Just a download, really)
  window.open().location.href = image
})

socket.on('welcome', init)

socket.on('update', update)

function onKeyDown(event) {
  console.log('key: ' + event.key)
  const tmpUser = JSON.parse(JSON.stringify(currentUser))
  switch (event.key) {
    case 'w':
      // tmpUser.pos.y += 0.1
      tmpUser.pos = nextPositionToward(1)
      break
    case 's':
      // tmpUser.pos.y -= 0.1
      tmpUser.pos = nextPositionToward(-1)
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
  socket.emit('move', tmpUser)
  checkFoods(tmpUser)
  checkUsers(tmpUser)
  console.log(tmpUser)
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
  if ((index = users.findIndex((val) => val.id === socket.id)) !== -1) {
    currentUser = users[index]
  }
  else {
    console.log('you\'ve been eaten')
    window.alert('you\'ve been eaten')
  }
  updateRank()
  console.log(currentUser)
}

function checkFoods(user) {
  for (let i = 0; i < foods.length; i++) {
    if (includeBall(user, foods[i])) {
      console.log('eat food', i)
      socket.emit('eat food', {
        food: foods[i],
        user: currentUser
      })
    }
  }
}

function checkUsers(user) {
  for (let i = 0; i < users.length; i++) {
    if (users[i].id !== user.id && includeBall(user, users[i])) {
      console.log('eat ball')
      socket.emit('eat ball', {
        currentUser: user,
        biggerUser: users[i].radius > user.radius ? users[i] : user,
        smallerUser: users[i].radius <= user.radius ? users[i] : user
      })
    }
  }
}

function includeBall(ball1, ball2) {
  return (
    (
      Math.pow(ball1.pos.x - ball2.pos.x, 2) +
      Math.pow(ball1.pos.y - ball2.pos.y, 2) +
      Math.pow(ball1.pos.z - ball2.pos.z, 2)
    ) <
    Math.pow(ball1.radius - ball2.radius, 2)
  )
}

function updateRank() {
  const rank = document.getElementById('users-table')
  rank.innerHTML = ''
  users.map(user => {
    const newRow = rank.insertRow(0)
    const nameCell = newRow.insertCell(0)
    const radiusCell = newRow.insertCell(1)
    const name = document.createTextNode(user.name)
    const radius = document.createTextNode(user.radius)
    nameCell.appendChild(name)
    radiusCell.appendChild(radius)
  })
}
