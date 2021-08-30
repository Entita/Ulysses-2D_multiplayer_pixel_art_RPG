// Server config
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require("socket.io")(server);

// MongoDN
const mongoose = require('mongoose')
const Message = require('./models/message')
const User = require('./models/user')
const chat = new Object()
const users = new Object()

// Get database data
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB')
    // Chat import
    Message.find().then(messages => {
        messages.map(message => {
            chat[message._id] = {
                player: message.player,
                message: message.message,
                createdAt: message.createdAt
            }
        })
    }).catch(err => console.error(err))

    // Users import
    User.find().then(people => {
        people.map(user => {
            users[user._id] = {
                id: user._id,
                nickname: user.nickname,
                email: user.email,
                password: user.password,
                createdAt: user.createdAt,
                characters: user.characters
            }
        })
    }).catch(err => console.error(err))
})

// Data config
const players = new Object(),
    messages = new Object(),
    map_width = 18,
    map_height = 18,
    map = createWorld(map_width, map_height)

function createWorld(width, height) {
    var map = new Array()
    for (let x = 0; x < width; x++) {
        map[x] = []
        for (let y = 0; y < height; y++) {
            if (Math.random() > .85) {
                map[x][y] = 1
            } else {
                map[x][y] = 0
            }
        }
    }
    return map
}

io.on('connection', socket => {
    socket.on('signIn', data => {
        // Insert user to database
        const userSchema = User(data)

        userSchema.save().then(user => {
            users[user._id] = {
                id: user._id,
                nickname: user.nickname,
                email: user.email,
                password: user.password,
                createdAt: user.createdAt,
                characters: user.characters
            }
            io.emit('signedIn', users[user._id])
        }).catch(err => console.error(err))
    })

    socket.on('addCharacter', character => {
        // Add character to database
        User.findOneAndUpdate({ _id: character.account_id }, { $push: { characters: character } }, err => {
            if (err) console.error('Adding character error: ', err)
        })
        users[character.account_id].characters.push(character)
        io.emit('updated_user', users[character.account_id])
    })

    socket.on('removeCharacter', character => {
        // Remove character from database
        User.findOneAndUpdate({ _id: character.account_id }, { $push: { characters: { $eq: character.id } } }, err => {
            if (err) console.error('Adding character error: ', err)
        })
        users[character.account_id].characters.remove(character.id)
        io.emit('removed_user', users[character.account_id])
    })

    socket.on('logIn', data => {
        var temp = true
        for (var id in users) {
            if (!users.hasOwnProperty(id)) continue;
            user = users[id]
            if ((user.nickname === data.name || user.email === data.name) && user.password === data.password) {
                io.emit('loggedIn', user)
                temp = false
            }
        }
        if (temp) {
            io.emit('loggedIn', false)
        }
    })

    socket.on('ready', data => {
        var player = {
            name: data.name,
            sprite: 'down',
            x: 383,
            y: 350,
            sprite_img: data.skin,
            sprite_width: 32,
            sprite_height: 48,
            width: 67,
            height: 100,
            speed: 10,
            moving: false
        }
        players[socket.id] = player

        io.emit('chat', chat)
        io.emit('world', map)
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

        socket.on('message', data => {
            var message = {
                text: data.message,
                time: data.time
            }
            messages[data.id] = message
            io.emit('update_messages', messages)

            // Insert message to database
            const messageSchema = Message({
                player: data.name,
                message: data.message
            })

            messageSchema.save().then(message => {
                chat[message._id] = {
                    player: message.player,
                    message: message.message,
                    createdAt: message.createdAt
                }
                io.emit('chat', chat)
            }).catch(err => console.error(err))
        })
    })
})

server.listen(process.env.PORT || 3000, () => {
    console.log('Server is listening ...');
});