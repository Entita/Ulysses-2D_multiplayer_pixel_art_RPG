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