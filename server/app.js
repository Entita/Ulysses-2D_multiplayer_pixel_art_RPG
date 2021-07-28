const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require("socket.io")(server);

// app.get('/', (req, res) => {
//     const path = __dirname.replace('\\server', '')
//     res.sendFile(path + '/client/index.html');
// });

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log('listening on :3000');
});