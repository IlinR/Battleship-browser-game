const express = require('express')
const path = require('path')
const http = require('http')

var bodyParser = require("body-parser");
const db = require('./db-connect');
const socketio = require('socket.io')
const app = express()
const server = http.createServer(app)
const wss = socketio(server)
const PORT = 4000
//const WebSocket = require('ws')
//const wss = new WebSocket.Server({server})

const connections=[null,null]

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("front"))



app.get('/', async (req, res) => {
  try {
    res.sendFile(path.join(__dirname + "/front/index.html"));
} catch (err) {
    res.end(err);
}
})

wss.on('connection', socket =>{
    let playerIndex = 3;
    for (const i in connections) {
      if (connections[i] === null) {
        playerIndex = i
        socket.emit('player-index', playerIndex)
        connections[playerIndex] = false
        break
      }
    }
    
    if (playerIndex === 3) {
      socket.emit('denied')
      return

    }
  

    socket.on('disconnect', () => {
      connections[playerIndex] = null
    })

    socket.on('player-ready', () => {
    socket.broadcast.emit('enemy-ready', playerIndex)
    connections[playerIndex] = true
  })

  socket.on('game-started', () => {
    startDate = new Date()
  })

  socket.on('ready-check', () => {
    socket.emit('ready-check', connections)
  })


  socket.on('shot', id => {
    socket.broadcast.emit('shot', id)
  })


  socket.on('shot-reply', square => {
    socket.broadcast.emit('shot-reply', square)
  })

  socket.on('game-ended', p => {
    endDate = new Date()
    db.add_data(startDate.toLocaleDateString(),startDate.toTimeString().split(' ')[0],(endDate-startDate)/1000,`player ${p} won`)
  })
  socket.on('get-data', async () => {
    let res = await db.get_data()
    socket.emit('send-data', res)
  })

  setTimeout(() => {
    connections[playerIndex] = null
    socket.emit('timeout')
    socket.disconnect()
  }, 600000) // 10 minute time limit 
  
})

server.listen(PORT, () => console.log(`Server running on port ${PORT}`))