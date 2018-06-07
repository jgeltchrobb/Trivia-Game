const socket = io.connect('http://localhost:9001')

// Query DOM
const form = document.querySelector('form')
const message = document.querySelector('#message')
const handle = document.querySelector('#handle')
const output = document.querySelector('#output')
const feedback = document.querySelector('#feedback')
const players = document.querySelector('#players')
const newGame = document.querySelector('#newGame')

newGame.addEventListener('click', () => {
  socket.emit('init', 'Init')
})

// Emit events
form.onsubmit = (e) => {
  e.preventDefault()
  socket.emit('chat', {
    answer: message.value,
    handle: handle.value
  })
  message.value = ''
}

socket.on('chat', (data) => {
  output.innerHTML += `<p><strong>${data.handle}:</strong> ${data.answer}</p>`
  
})

socket.on('question', (question) => {
  console.log(question)
})

socket.on('winner', (data) => {
  output.innerHTML += `<p><strong>${data.handle} wins with answer: ${data.answer}</strong></p>`
})