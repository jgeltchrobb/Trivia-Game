const express = require('express')
const socket = require('socket.io')
const fetch = require("node-fetch");
const port = 9001
let players = []
let questions = null

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

  socket.on('handle', (handle) => {
    if (socket.handle !== handle) {
      for (let obj of players) {
        if (socket.handle === obj.name) {
          players.splice(players.indexOf(obj), 1)
        }
      }
      socket.handle = handle
    }
    getName(socket)
  })

  socket.on('chat', (data) => {
    io.sockets.emit('chat', data)
  })

  socket.on('correct', () => {
    io.sockets.emit('winner', socket.handle)
    for (let obj of players) {
      if (obj.id === socket.id) {
        obj.score += 1
      }
    }
    io.sockets.emit('playerUpdate', players)    
  })

  socket.on('disconnect', () => {
    for (let obj of players) {
      if (socket.handle === obj.name) {
        players.splice(players.indexOf(obj), 1)
      }
    }
    io.sockets.emit('playerUpdate', players)    
  })
})

startGame = () => {
  io.sockets.emit('new-game')
  getQs()
  setTimeout(() => {
    askQ()
  }, 7000);
}

askQ = () => {
  setInterval(() => {
    if (questions.length > 0) {
      let qData = questions[questions.length - 1]
      questions.pop()
      io.sockets.emit('question', qData)
    }
  }, 3000)
}

getQs = () => {
  const qUrl = 'https://opentdb.com/api.php?amount=10&category=18'
  fetch(qUrl).then((response) => {
    return response.json()
  }).then((jsonRes) => {
    let count = 1
    for (let obj of jsonRes.results) {
      obj.id = count
      let answers = []
      let finalAns = []
      count += 1
      answers.push(obj.correct_answer)
      for (let inc of obj.incorrect_answers) {
        answers.push(inc)
      }
      shuffle(answers)
      let pH = null
      for (let i in answers) {
        if (i == 0) {
          pH = 'a'
        } else if (i == 1) {
          pH = 'b'
        } else if (i == 2) {
          pH = 'c'
        } else if (i == 3) {
          pH = 'd'
        }
        finalAns.push({num: pH, answer: answers[i]})
        obj.all_answers = finalAns
      }
    }
    questions = jsonRes.results
  })
}

getName = (socket) => {
  const nameGenUrl = `https://wunameaas.herokuapp.com/enterthewu/${socket.handle}`
  fetch(nameGenUrl, {
    headers: {
      'Accept': 'text/plain',
      'Content-Type': 'text/plain'
    },  
  }).then((response) => {
    return response.text()
  }).then((result) => {
    let handle = result.split(' ').slice(-2)
    handle = checkHandle(handle)
    players.push({ id: socket.id, name: socket.handle, handle: handle.join(' '), message: result, score: 0})
    io.sockets.emit('playerUpdate', players)
  }).catch((error) => {
    console.log(error)
  })
}

// Removes punctuation from handle
checkHandle = (handle) => {
  let str1 = handle[0]
  str1 = str1.match(/[a-zA-Z]+/g);
  let str2 = handle[1]
  str2 = str2.match(/[a-zA-Z]+/g);
  str1.push(str2[0])
  return str1
}

// Shuffle answers
shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}