const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require("socket.io")(server);

var position = {
    x: 200,
    y: 200
}

app.get('/', (req, res) => {
    res.send('Hello world')
});

io.on('connection', (socket) => {
    socket.emit('position', position)
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log('Server is listening ...');
});