const express = require('express');
const app = express();
const server = require('https').createServer(app);
const io = require("socket.io")(server);

app.get('/', (req, res) => {
    // const path = __dirname.replace('\\server', '')
    // res.sendFile(path + '/client/index.html');
    res.send('Hello world')
});

app.get('/api', (req, res) => {
    res.json({ api: 'Some data' })
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log('Server is listening ...');
});