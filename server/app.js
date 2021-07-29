const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require("socket.io")(server);
var players = []

io.on('connection', (socket) => {
    players.push(socket.id)
    const new_con_data = {
        'players': players,
        'socket_id': socket.id
    }
    io.emit('user_connected', new_con_data)

    socket.on('disconnect', (socket) => {
        players = players.filter(item => item.socket_id !== socket.id)
        const new_dis_data = {
            'players': players,
            'socket_id': socket.id
        }
        io.emit('user_disconnected', new_dis_data)
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