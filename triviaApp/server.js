const express = require('express')
const socket = require('socket.io')
const port = 9001
let players = []
const question = "How did harry meet sally"
const answer = "yes"

const app = express()
const server = app.listen(port, () => {
  console.log(`Server listening on port: ${port}`)
})

app.use(express.static('public'))

const io = socket(server)

io.on('connection', (socket) => {
  console.log('Connection made...')

  socket.on('init', () => {
    startGame()
  })

  socket.on('chat', (data) => {
    socket.handle = data.handle
    io.sockets.emit('chat', data)
    if (data.answer === answer) {
      io.sockets.emit('winner', data)
    }
  })

})

startGame = () => {
  setInterval(() => {
    io.sockets.emit('question', question)
  }, 3000)
}