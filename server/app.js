const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require("socket.io")(server);
var players = []

io.on('connection', (socket) => {
    const player = {
        socket_id: socket.id
    }
    players.push(player)
    io.emit('user_connected', players)

    socket.on('disconnect', () => {
        players = players.filter(item => item !== player.socket_id)
        io.emit('user_disconnected', players)
    });

    socket.on('move', data => {
        switch (data) {
            case 'up':
                io.emit('position', data)
                break;
            case 'down':
                io.emit('position', data)
                break;
            case 'left':
                io.emit('position', data)
                break;
            case 'right':
                io.emit('position', data)
                break;
        }
    })
});

server.listen(process.env.PORT || 3000, () => {
    console.log('Server is listening ...');
});