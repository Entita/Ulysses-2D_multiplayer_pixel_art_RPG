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
    socket.on('ready', (id) => {
        player.socket_id = id
        players[id] = player
        console.log(players)

        io.emit('update', players)
    })
})

// io.on('connection', socket => {
//     var player = {
//         socket_id: socket.id
//     }
//     players.push(player)
//     io.emit('user_connected', player)

//     socket.on('update_player', data => {
//         let index = players.findIndex((obj => obj.socket_id == data.socket_id))
//         players[index] = data
//         io.emit('players_updated', players)
//     })

//     socket.on('disconnect', () => {
//         players = players.filter(item => item.socket_id !== player.socket_id)
//         io.emit('user_disconnected', players)
//     });

//     socket.on('move', data => {
//         switch (data) {
//             case 'up':
//                 io.emit('position', data)
//                 break;
//             case 'down':
//                 io.emit('position', data)
//                 break;
//             case 'left':
//                 io.emit('position', data)
//                 break;
//             case 'right':
//                 io.emit('position', data)
//                 break;
//         }
//     })
// });



server.listen(process.env.PORT || 3000, () => {
    console.log('Server is listening ...');
});