const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require("socket.io")(server);

var position = {
    x: 200,
    y: 200
}

// app.get('/', (req, res) => {
//     res.send('Hello world')
// });

io.on('connection', (socket) => {
    socket.emit('position', position)

    console.log('a user connected');
    io.emit('user_connected')
    socket.on('disconnect', () => {
        console.log('user disconnected');
        io.emit('user_disconnected')
    });
    socket.on('move', data => {
        switch (data) {
            case 'up':
                position.y -= 5;
                io.emit('position', position)
                break;
            case 'down':
                position.y += 5;
                io.emit('position', position)
                break;
            case 'left':
                position.x -= 5;
                io.emit('position', position)
                break;
            case 'right':
                position.x += 5;
                io.emit('position', position)
                break;
        }
    })
});

server.listen(process.env.PORT || 3000, () => {
    console.log('Server is listening ...');
});