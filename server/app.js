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
            sprite_img: 'starlord',
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
            var player = players[data.id]
            if (data.w) {
                if (data.s) {
                    console.log('running and not moving')
                    player.moving = false
                } {
                    player.y = (player.y - player.speed) >= 0 ? player.y - player.speed : player.y
                    player.moving = true
                    player.sprite = 'up'
                }
            }
            if (data.s) {
                player.y = (player.y + player.speed) > (data.height - player.height) ? player.y : player.y + player.speed
                player.moving = true
                player.sprite = 'down'
            }
            if (data.a) {
                player.x = (player.x - player.speed) >= 0 ? player.x - player.speed : player.x
                player.moving = true
                player.sprite = 'left'
            }
            if (data.d) {
                player.x = (player.x + player.speed) > (data.width - player.width) ? player.x : player.x + player.speed
                player.moving = true
                player.sprite = 'right'
            }
            io.emit('update', players)
        })

        socket.on('stopped', id => {
            players[id].moving = false
            io.emit('update', players)
        })

        socket.on('skin', data => {
            players[data.id].sprite_img = data.img
            io.emit('update', players)
        })
    })
})

server.listen(process.env.PORT || 3000, () => {
    console.log('Server is listening ...');
});