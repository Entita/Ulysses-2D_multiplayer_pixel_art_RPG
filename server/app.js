// Server config
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require("socket.io")(server);

// Data config
var players = new Object()
var player = {
    sprite: 'down',
    x: 0,
    y: 0,
    sprite_img: 'img/sprite_starlord.png',
    sprite_width: 32,
    sprite_height: 48,
    width: 67,
    height: 100,
    speed: 10,
    moving: false
}

// Connections
io.on('connection', socket => {
    socket.on('ready', () => {
        player.socket_id = socket.id
        players[socket.id] = player
        console.log(socket.id)

        io.emit('update', players)
    })
})

server.listen(process.env.PORT || 3000, () => {
    console.log('Server is listening ...');
});