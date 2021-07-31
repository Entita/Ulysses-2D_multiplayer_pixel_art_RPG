// Server config
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require("socket.io")(server);

// Database config
const mysql = require('mysql')
const con = mysql.createConnection({
    host: 'us-cdbr-east-04.cleardb.com',
    user: 'b2897456ec879f',
    password: '0eac8e17',
    database: 'heroku_8ecd47b8b69c15c'
})

// Data config
const players = new Object(),
    messages = new Object()

con.connect(function (err) {
    if (err) throw err
    console.log("connected")
    var sql = "SELECT * FROM messages";
    con.query(sql, (err, results) => {
        if (err) throw err
        console.log(results)
    })
})

io.on('connection', socket => {
    socket.on('ready', () => {
        var player = {
            sprite: 'down',
            x: 450,
            y: 450,
            sprite_img: 'starlord',
            sprite_width: 32,
            sprite_height: 48,
            width: 67,
            height: 100,
            speed: 10,
            moving: false
        }
        players[socket.id] = player
        io.emit('update_players', players)
        io.emit('player_connected', player)

        socket.on('disconnect', () => {
            io.emit('player_disconnected', players[socket.id])
            delete players[socket.id]
            io.emit('update_players', players)
        })

        socket.on('move', data => {
            var player = players[data.id]
            if (data.w) {
                player.y = (player.y - player.speed) >= 0 ? player.y - player.speed : player.y
                player.moving = true
                player.sprite = 'up'
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
                if (data.a && data.w) {
                    player.sprite = 'up'
                } else if (data.a && data.s) {
                    player.sprite = 'down'
                }
            }
            if (data.w && data.s && (!data.a && !data.d)) {
                player.moving = false
            }
            if (data.a && data.d && (!data.w && !data.s)) {
                player.moving = false
            }

            io.emit('update_players', players)
        })

        socket.on('stopped', id => {
            players[id].moving = false
            io.emit('update_players', players)
        })

        socket.on('skin', data => {
            players[data.id].sprite_img = data.img
            io.emit('update_players', players)
        })

        socket.on('message', data => {
            var message = {
                text: data.message,
                time: data.time
            }
            messages[data.id] = message
            io.emit('update_messages', messages)
        })
    })
})

server.listen(process.env.PORT || 3000, () => {
    console.log('Server is listening ...');
});