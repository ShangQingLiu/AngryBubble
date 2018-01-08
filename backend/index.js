const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const path = require('path')
const config = require('./config.json')

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
    let index
    if ((index = users.findIndex((val) => val.id === newUser.id)) !== -1)
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
      users[index] = user
    }
    io.emit('update', {
      users: users,
      foods: foods
    })
  })

  socket.on('eat food', food => {
    let index = foods.findIndex((val) => val.id === food.id)
    console.log('a food eaten')
    foods.splice(index, 1)
    io.emit('update', {
      users: users,
      foods: foods
    })
  })

  socket.on('eat user', args => {
    let biggerIdx = users.findIndex((val) => val.id === args.biggerUser.id)
    let smallerIdx = users.findIndex((val) => val.id === args.smallerUser.id)
    if (biggerIdx !== -1 && smallerIdx !== -1) {
      console.log('a user eaten')
      users[biggerIdx].radius = Math.sqrt(
        Math.pow(users[biggerIdx].radius, 3) +
        Math.pow(users[smallerIdx].radius, 3)
      )
      users.splice(smallerIdx, biggerIdx)
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
      pos: { // todo: range
        x: Math.random() * 10,
        y: Math.random() * 10,
        z: Math.random() * 10
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

function addFoods() {
  if (foods.length < config.food.maxFoods) {
    for (let i = 0; i < config.food.newBallInAddition; i++) {
      const food = {
        id: Math.random().toString(36).substr(2, 16),
        radius: config.food.size,
        pos: { // todo: range
          x: Math.random() * 10,
          y: Math.random() * 10,
          z: Math.random() * 10
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