const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const path = require('path')
const config = require('./config.json')
const stone = [
  {
    pos: {
      x: 2,
      y: 7,
      z: 3
    },
    radius: 0.3
  },
  {
    pos: {
      x: 4,
      y: 5,
      z: 4
    },
    radius: 0.3
  },
  {
    pos: {
      x: 1,
      y: 5,
      z: 8
    },
    radius: 0.3
  },
  {
    pos: {
      x: 3,
      y: 2,
      z: 9
    },
    radius: 0.3
  }
]

app.use(express.static(path.resolve(__dirname + '/../frontend')))

let users = []
let foods = []

io.on('connection', socket => {
  console.log('a user connected')
  socket.on('disconnect', () => {
    console.log('user disconnect')
  })

  socket.on('enter', name => {
    console.log(`User [${name}] entered.`)

    if (users.length === 0) { // first user
      initFoods()
    } else {
      addFoods()
    }

    const newUser = {
      id: socket.id,
      name: name,
      pos: {
        x: Math.random(),
        y: Math.random(),
        z: Math.random()
      },
      radius: config.initSize
    }
    while (checkInclude(newUser)) {
      newUser.pos = {
        x: Math.random(),
        y: Math.random(),
        z: Math.random()
      }
    }
    let index = users.findIndex((val) => val.id === newUser.id)
    if (index !== -1)
      users[index] = newUser
    else
      users.push(newUser)

    console.log(users)

    socket.emit('welcome', {
      users: users,
      foods: foods
    })
    socket.broadcast.emit('update', {
      users: users,
      foods: foods
    })
  })

  socket.on('move', user => {
    if (user != null) {
      console.log(`user ${user.name} moving...`)
      let index = users.findIndex((val) => val.id === user.id)
      if (index !== -1)
        users[index] = user
    }
    io.emit('update', {
      users: users,
      foods: foods
    })
  })

  socket.on('eat food', args => {
    let foodIdx = foods.findIndex((val) => val.id === args.food.id)
    let userIdx = users.findIndex((val) => val.id === args.user.id)
    if (foodIdx !== -1 && userIdx !== -1) {
      console.log('a food eaten, ', userIdx)
      users[userIdx].radius = users[userIdx].radius + config.food.size
      console.log(users)
      // users[userIdx].radius = Math.sqrt(
      //   Math.pow(users[userIdx].radius, 3) +
      //   Math.pow(config.food.size, 3)
      // )
      console.log(users[userIdx].radius)
      foods.splice(foodIdx, 1)
      io.emit('update', {
        // users: users,
        users: JSON.parse(JSON.stringify(users)),
        foods: foods
      })
    }
  })

  socket.on('eat ball', args => {
    let biggerIdx = users.findIndex((val) => val.id === args.biggerUser.id)
    let smallerIdx = users.findIndex((val) => val.id === args.smallerUser.id)
    if (biggerIdx !== -1 && smallerIdx !== -1) {
      console.log('a user eaten')
      // users[biggerIdx].radius += config.food.size
      users[biggerIdx].radius = Math.pow(
        Math.pow(users[biggerIdx].radius, 3) +
        Math.pow(users[smallerIdx].radius, 3),
        0.33333333333
      )
      users.splice(smallerIdx, 1)
      io.emit('update', {
        users: users,
        foods: foods
      })
    }
  })
})

http.listen(3000, () => {
  console.log('listening on *:3000')
})

/////////////////// Functions //////////////////////

function initFoods() {
  foods = []
  for (let i = 0; i < config.food.initNum; i++) {
    const food = {
      id: Math.random().toString(36).substr(2, 16),
      radius: config.food.size,
      pos: {
        x: 2 * Math.random() * config.food.maxDistance - config.food.maxDistance,
        y: 2 * Math.random() * config.food.maxDistance - config.food.maxDistance,
        z: 2 * Math.random() * config.food.maxDistance - config.food.maxDistance
      },
      color: {
        r: Math.random(),
        g: Math.random(),
        b: Math.random()
      }
    }
    foods.push(food)
  }
}

function addFoods() {
  if (foods.length < config.food.maxFoods) {
    for (let i = 0; i < config.food.newBallInAddition; i++) {
      const food = {
        id: Math.random().toString(36).substr(2, 16),
        radius: config.food.size,
        pos: {
          x: 2 * Math.random() * config.food.maxDistance - config.food.maxDistance,
          y: 2 * Math.random() * config.food.maxDistance - config.food.maxDistance,
          z: 2 * Math.random() * config.food.maxDistance - config.food.maxDistance
        },
        color: {
          r: Math.floor(Math.random() * 255),
          g: Math.floor(Math.random() * 255),
          b: Math.floor(Math.random() * 255)
        }
      }
      foods.push(food)
    }
  }
}

function checkInclude(user) {
  for (let i = 0; i < users.length; i++) {
    if (users[i].id !== user.id && includeBall(user, users[i])) {
      return true
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
