const socket = io()
const config = {
  'boarderRadius': 40,
  'sceneRadius': 64,
  'cameraInitDistance': 7,
  'cameraMaxDistance': 20,
  'cameraMinRatio': 3,
  'cameraMinDistance': 12,
  'cameraMoveStepBase': 2,
  'moveBaseStep': 3,
  'collisionBounce': 5,
  'maxBallRadius': 10
}
let users = []
let foods = []
const stone = [ // todo: need sync between frontend and backend
  {
    pos: {
      x: -7,
      y: -2,
      z: -18
    },
    radius: 2.5
  },
  {
    pos: {
      x: -32,
      y: -27,
      z: -13
    },
    radius: 5
  },
  {
    pos: {
      x: 16,
      y: -19,
      z: 15
    },
    radius: 6.4
  },
  {
    pos: {
      x: -21,
      y: -29,
      z: 25
    },
    radius: 5
  },
  {
    pos: {
      x: 32,
      y: 27,
      z: -33
    },
    radius: 5
  },
  {
    pos: {
      x: 17,
      y: 39,
      z: 35
    },
    radius: 7.4
  },
  {
    pos: {
      x: 3,
      y: 7,
      z: 9
    },
    radius: 2.0
  }
]
let currentUser
const canvas = document.getElementById('main')
canvas.height = window.innerHeight
canvas.width = window.innerWidth

$('.modal').modal({
  complete: () => {
    window.location.reload()
  }
})

document.querySelector('#input').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    document.getElementById('cover').style.visibility = 'hidden'
    document.getElementById('panel').style.visibility = 'visible'
    socket.emit('enter', event.target.value)
    event.target.value = ''
  }
})

document.addEventListener('keydown', onKeyDown, true)

document.getElementById('save').addEventListener('click', function () {
    // event.preventDefault()
    // const image = canvas.toDataURL()
    // console.log(image)
    // document.write(`<img src="${image}"/>`)
    // window.open().location = image
    // let image = document.getElementById('main').toDataURL('image/png').replace('image/png', 'image/octet-stream') //Convert image to 'octet-stream' (Just a download, really)
    // this.download = 'scene.png'
    // window.open().location.href = image
    downloadCanvas(this, 'main', 'scene.png')

    function downloadCanvas(link, canvasId, filename) {
      link.href = document.getElementById(canvasId).toDataURL()
      link.download = filename
    }
  }
)

socket.on('welcome', init)

socket.on('update', update)

function onKeyDown(event) {
  console.log('key: ' + event.key)
  const tmpUser = JSON.parse(JSON.stringify(currentUser))
  switch (event.key) {
    case 'w':
      tmpUser.pos = nextPositionToward(config.moveBaseStep / currentUser.radius)
      if (checkCollision(tmpUser))
        currentUser.pos = nextPositionToward(-config.collisionBounce)
      break
    case 's':
      tmpUser.pos = nextPositionToward(-config.moveBaseStep / currentUser.radius)
      if (checkCollision(tmpUser))
        currentUser.pos = nextPositionToward(config.collisionBounce)
      break
    case 'a':
      break
    case 'd':
      break
    default:
      break
  }
  // update(users)
  if (!checkCollision(tmpUser)) {
    socket.emit('move', tmpUser)
    checkFoods(tmpUser)
    checkUsers(tmpUser)
  }
  // console.log(tmpUser)
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
  // console.log('update user')
  users = args.users
  foods = args.foods
  let index
  if ((index = users.findIndex((val) => val.id === socket.id)) !== -1) {
    currentUser = users[index]
  }
  else {
    console.log('you\'ve been eaten')
    // window.alert('you\'ve been eaten')
    $('#modal1').modal('open')
  }
  updateRank()
  // console.log(currentUser)
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
    const radius = document.createTextNode(user.radius.toFixed(2))
    nameCell.appendChild(name)
    radiusCell.appendChild(radius)
  })
}

function checkCollision(user) {
  const borderRadius = config.boarderRadius
  if (Math.pow(user.pos.x, 2) + Math.pow(user.pos.y, 2) + Math.pow(user.pos.z, 2) > borderRadius * borderRadius) {
    return true
  }
  for (const s of stone) {
    console.log(s)
    if ((
        Math.pow(user.pos.x - s.pos.x, 2) +
        Math.pow(user.pos.y - s.pos.y, 2) +
        Math.pow(user.pos.z - s.pos.z, 2)
      ) <
      Math.pow(user.radius + s.radius, 2)) {
      return true
    }
  }
}
