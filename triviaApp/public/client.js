const socket = io.connect('http://localhost:9001')

// Query DOM
const gameWindow = document.querySelector('#game-window')
const hndlForm = document.querySelector('#handle-form')
const msgForm = document.querySelector('#message-form')
const handle = document.querySelector('#handle')
const message = document.querySelector('#message')
const output = document.querySelector('#output')
const feedback = document.querySelector('#feedback')
const players = document.querySelector('#players')
const newGame = document.querySelector('#newGame')
let gameInProgress = false
let currentQuestion = null
let currentAnswerNum = null
let currentAnswer = null
let questionOpen = true

let playerData = null

window.onload = () => {
  handle.value = getCookie('handle')
  socket.emit('handle', handle.value)
}

newGame.addEventListener('click', () => {
  socket.emit('init', 'Init')
})

socket.on('new-game', () => {
  gameInProgress = true
  output.innerHTML += '<p><strong>Starting new game...</strong></p>'

  let count = 1
  let gameCountdown = setInterval(() => {
    if (count < 6) {
      output.innerHTML += `<p>${count}</p>`
      count += 1
      gameWindow.scrollTop = gameWindow.scrollHeight            
    } else {
      output.innerHTML += '<p><strong>Game starting...</strong></p>'
      gameWindow.scrollTop = gameWindow.scrollHeight      
      clearInterval(gameCountdown)
    }
    }, 1000)
})

// Emit Event - Client submits handle
hndlForm.onsubmit = (e) => {
  e.preventDefault()
  socket.emit('handle', handle.value)
}

// Emit Event - Client submits message
msgForm.onsubmit = (e) => {
  e.preventDefault()
  socket.emit('chat', {
    answer: message.value,
    handle: handle.value
  })
  if (gameInProgress && questionOpen) {
    if (message.value === currentAnswerNum) {
      socket.emit('correct')
      questionOpen = false
    }
  }
  message.value = ''
}

// Receiving all players data from server
socket.on('playerUpdate', (data) => {
  playerData = data
  players.innerHTML = ''
  for (let player of playerData) {
    if (player.name === handle.value) {
      output.innerHTML += `<p><strong>${player.message}</strong></p>`
      handle.value = player.handle
      document.cookie = `handle=${handle.value}`
      console.log(document.cookie)
    }
    players.innerHTML += `<p><strong>${player.handle}: ${player.score}</strong></p>`
  }
})

// Receiving chat message from server
socket.on('chat', (data) => {
  output.innerHTML += `<p><strong>${data.handle}:</strong> ${data.answer}</p>`
  gameWindow.scrollTop = gameWindow.scrollHeight;
  
})

// Receiving a question from server
socket.on('question', (data) => {
  questionOpen = true
  currentQuestion = data
  currentAnswer = data.correct_answer  
  output.innerHTML += `<p><strong>${data.id}: ${data.question}</strong></p>`
  for (let answer of data.all_answers) {
    if (answer.answer === data.correct_answer) {
      currentAnswerNum = answer.num
    }
    output.innerHTML += `<li>${answer.num}: ${answer.answer}</li>`
  }
  gameWindow.scrollTop = gameWindow.scrollHeight  
})

// Receiving a winner from server
socket.on('winner', (data) => {
  output.innerHTML += `<p><strong>${handle.value} wins with answer (${currentAnswerNum}) ${currentAnswer}</strong></p>`
})

getCookie = (name) => {
  var re = new RegExp(name + "=([^;]+)");
  var value = re.exec(document.cookie);
  return (value != null) ? unescape(value[1]) : null;
}

