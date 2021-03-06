// Server config
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require("socket.io")(server)
const moment = require('moment')
const nodeMailer = require('nodemailer')

// MongoDN
const mongoose = require('mongoose')
const { send } = require('process')
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
                createdAt: moment(message.createdAt).format('MMMM Do YYYY')
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
                createdAt: moment(user.createdAt).format('MMMM Do YYYY'),
                characters: user.characters,
                verified: user.verified
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
        var isEmailUnique = true
        var isNicknameUnique = true
        for (var id in users) {
            if (!users.hasOwnProperty(id)) continue
            user = users[id]

            if (user.email === data.email) {
                isEmailUnique = false
                break
            }
            if (user.nickname === data.nickname) {
                isNicknameUnique = false
                break
            }
        }

        if (!isEmailUnique) {
            socket.emit('signedIn', 'mail')
        } else if (!isNicknameUnique) {
            socket.emit('signedIn', 'nickname')
        } else {
            userSchema.save().then(user => {
                users[user._id] = {
                    id: user._id,
                    nickname: user.nickname,
                    email: user.email,
                    password: user.password,
                    createdAt: moment(user.createdAt).format('MMMM Do YYYY'),
                    characters: user.characters,
                    verified: user.verified
                }

                // Send verify email
                const transporter = nodeMailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'ulyssess.game@gmail.com',
                        pass: process.env.GMAIL_PASSWORD
                    }
                }), html = '<h1>Thank <i>YOU</i> for registration.</h1>\
                            <br>\
                            <a href="https://gentle-island-28675.herokuapp.com/validation/' + user._id + '">Verification link</a>'

                var mailOptions = {
                    from: 'ulyssess.game@gmail.com',
                    to: user.email,
                    subject: 'Verification link to Ulysses',
                    html: html
                }

                transporter.sendMail(mailOptions, err => {
                    if (err) console.log(err)
                    else socket.emit('signedIn', users[user._id])
                })
            }).catch(err => console.error(err))
        }
    })

    socket.on('addCharacter', character => {
        // Add character to database
        User.findOneAndUpdate({ _id: character.account_id }, { $push: { characters: character } }, (err, data) => {
            if (err) console.error('Adding character error: ', err)
            else {
                users[character.account_id].characters.push(character)

                const update_user = {
                    account_id: character.account_id,
                    type: 'update',
                    user: users[character.account_id]
                }
                io.emit('update_user', update_user)
            }
        })
    })

    socket.on('removeCharacter', character => {
        // Remove character from database
        const index = users[character.account_id].characters.findIndex(char => char.name === character.name)
        User.updateOne({ _id: character.account_id }, { $pull: { characters: { name: character.name } } }, (err, data) => {
            if (err) console.error('Removing character error: ', err)
            else {
                users[character.account_id].characters.splice(index, 1)

                const update_user = {
                    account_id: character.account_id,
                    type: 'update',
                    user: users[character.account_id]
                }

                io.emit('update_user', update_user)
            }
        })
    })

    socket.on('logIn', data => {
        var temp = true
        for (var id in users) {
            if (!users.hasOwnProperty(id)) continue
            user = users[id]
            if ((user.nickname === data.name || user.email === data.name) && user.password === data.password) {
                if (!user.verified) {
                    socket.emit('loggedIn', 'not verified')
                } else {
                    socket.emit('loggedIn', user)
                    temp = false
                }
            }
        }
        if (temp) {
            socket.emit('loggedIn', false)
        }
    })

    socket.on('ready', data => {
        const update_user = {
            account_id: data.account_id,
            type: 'logout'
        }
        socket.broadcast.emit('update_user', update_user)

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

        socket.on('disconnectedManually', () => {
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
                    createdAt: moment(message.createdAt).format('MMMM Do YYYY')
                }
                io.emit('chat', chat)
            }).catch(err => console.error(err))
        })
    })
})

app.get('/validation/:id', (req, res) => {
    const validation_id = req.params.id
    if (users[validation_id]) {
        User.findOneAndUpdate({ _id: validation_id }, { verified: true }, (err, data) => {
            if (err) console.error('Verifying character error: ', err)
            else {
                users[validation_id].verified = true

                const update_user = {
                    account_id: data.account_id,
                    type: 'update',
                    user: users[validation_id]
                }
                socket.emit('update_user', update_user)

                res.sendFile('verify.html', { root: __dirname });
            }
        })
    }
})

server.listen(process.env.PORT || 3000, () => {
    console.log('Server is listening ...')
})