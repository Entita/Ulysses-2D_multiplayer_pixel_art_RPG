// Server config
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require("socket.io")(server);

// Data config
const players = new Object()

io.on('connection', socket => {
    socket.on('ready', () => {
        var player = {
            socket_id: socket.id,
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
        players[socket.id] = player
        io.emit('update', players)

        socket.on('disconnect', () => {
            delete players[socket.id]
            io.emit('update', players)
        })

        socket.on('move', data => {
            console.log(data)
            if (data.w) {
                players[data.id].y = (players[data.id].y - players[data.id].speed) >= 0 ? players[data.id].y - players[data.id].speed : players[data.id].y
                players[data.id].moving = true
                players[data.id].sprite = 'up'
            }
            if (data.s) {
                players[data.id].y = (players[data.id].y + players[data.id].speed) > (players[data.id].height - players[data.id].height) ? players[data.id].y : players[data.id].y + players[data.id].speed
                players[data.id].moving = true
                players[data.id].sprite = 'down'
            }
            if (data.a) {
                players[data.id].x = (players[data.id].x - players[data.id].speed) >= 0 ? players[data.id].x - players[data.id].speed : players[data.id].x
                players[data.id].moving = true
                players[data.id].sprite = 'left'
            }
            if (data.d) {
                players[data.id].x = (players[data.id].x + players[data.id].speed) > (players[data.id].width - players[data.id].width) ? players[data.id].x : players[data.id].x + players[data.id].speed
                players[data.id].moving = true
                players[data.id].sprite = 'right'
            }
            io.emit('update', players)
        })
    })
})

server.listen(process.env.PORT || 3000, () => {
    console.log('Server is listening ...');
});