const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require("socket.io")(server);
var players = []

io.on('connection', (socket) => {
    players.push(socket.id)
    const new_data = {
        'players': players,
        'socket_id': socket.id
    }
    io.emit('user_connected', new_data)

    socket.on('disconnect', (socket) => {
        console.log('a',players, new_con_data['socket_id'])
        players = players.filter(item => item !== new_con_data['socket_id'])
        new_data['players'] = players

        console.log('b',new_data)
        console.log('c',players)
        io.emit('user_disconnected', new_data)
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