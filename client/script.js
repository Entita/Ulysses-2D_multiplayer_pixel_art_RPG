var app = new Vue({
    el: '#app',
    data() {
        return {
            socket: {},
            animationStates: [],
            characters: [
                'starlord',
                'tonystark',
                'thor',
                'rocket',
                'loki',
                'deadpool',
                'captainamerica'
            ]
        }
    },
    created() {
        this.socket = io('https://gentle-island-28675.herokuapp.com/', { transports: ['websocket'] })
        this.animationStates = [
            { name: 'down', frames: 4 },
            { name: 'left', frames: 4 },
            { name: 'right', frames: 4 },
            { name: 'up', frames: 4 }
        ]
    },
    mounted() {
        var this_ = this
        var socketID
        // Socket.io
        this_.socket.on('position', data => {
            console.log('position changed', data)
        })

        this_.socket.on('players_updated', data => {
            console.log('all players', data)
            players = data
        })

        this_.socket.on('user_connected', socket => {
            socketID = this_.socket.id
            const player = {
                socket_id: socket.socket_id,
                sprite: 'down',
                spriteDir: 0,
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
            this_.socket.emit('update_player', player)

            if (players.length === 0) {
                // Load Sprites
                this_.animationStates.forEach((state, i) => {
                    let frames = {
                        location: []
                    }
                    for (let j = 0; j < state.frames; j++) {
                        let positionX = j * player.sprite_width
                        let positionY = i * player.sprite_height
                        frames.location.push({ x: positionX, y: positionY })
                    }
                    spriteAnimations[state.name] = frames
                })
            }
            players.push(player)
        })

        this_.socket.on('user_disconnected', data => {
            console.log('player disconnected', data)
            players = data
        })

        // Canvas
        const canvas = document.getElementById('game'),
            ctx = canvas.getContext('2d'),
            canvas_width = canvas.width = 900,
            canvas_height = canvas.height = 900

        // Game engine
        let fpsInterval, now, then, elapsed,
            fps = 30,
            sprintX = 0

        // Sprite movement
        const spriteAnimations = [],
            keys = []

        // Multiplayer
        var players = []

        startAnimating(fps)

        function startAnimating(fps) {
            fpsInterval = 1000 / fps
            then = Date.now()
            startTime = then
            animate()
        }

        function animate() {
            requestAnimationFrame(animate)
            now = Date.now()
            elapsed = now - then
            if (elapsed > fpsInterval) {
                then = now - (elapsed % fpsInterval)

                animateSprint()
            }
        }

        /* Functions */
        function animateSprint() {
            ctx.clearRect(0, 0, canvas_width, canvas_height)
            for (let index = 0; index < players.length; index++) {
                let position = players[index].moving ? sprintX % spriteAnimations[players[index].sprite].location.length : 0
                let frameX = players[index].sprite_width * position
                let frameY = spriteAnimations[players[index].sprite].location[position].y
                var image = new Image()
                image.src = players[index].sprite_img
                ctx.drawImage(image, frameX, frameY, players[index].sprite_width, players[index].sprite_height, players[index].x, players[index].y, players[index].width, players[index].height)
            }
            sprintX++
            moveSprite()
        }

        function movingSprint(player, dir) {
            player.moving = true
            player.sprite = dir
            this_.socket.emit('move', players)
        }

        function moveSprite() {
            if (keys['w']) {
                var thisPlayer = getCurrentPlayer()
                thisPlayer.y = (thisPlayer.y - thisPlayer.speed) >= 0 ? thisPlayer.y - thisPlayer.speed : thisPlayer.y
                movingSprint(thisPlayer, 'up')
            }
            if (keys['s']) {
                var thisPlayer = getCurrentPlayer()
                thisPlayer.y = (thisPlayer.y + thisPlayer.speed) > (canvas_height - thisPlayer.height) ? thisPlayer.y : thisPlayer.y + thisPlayer.speed
                movingSprint(thisPlayer, 'down')
            }
            if (keys['a']) {
                var thisPlayer = getCurrentPlayer()
                thisPlayer.x = (thisPlayer.x - thisPlayer.speed) >= 0 ? thisPlayer.x - thisPlayer.speed : thisPlayer.x
                movingSprint(thisPlayer, 'left')
            }
            if (keys['d']) {
                var thisPlayer = getCurrentPlayer()
                thisPlayer.x = (thisPlayer.x + thisPlayer.speed) > (canvas_width - thisPlayer.width) ? thisPlayer.x : thisPlayer.x + thisPlayer.speed
                movingSprint(thisPlayer, 'right')
            }
        }

        function getCurrentPlayer() {
            return players.filter(obj => {
                return obj.socket_id === socketID
            })
        }

        /* Event Listeners */
        const dropdown = document.getElementById('animations')
        dropdown.addEventListener('change', e => {
            getCurrentPlayer().sprite_img = 'img/sprite_' + e.target.value + '.png'
        })

        window.addEventListener('keydown', e => {
            key = e.key.toLowerCase()
            keys[key] = true
        })
        window.addEventListener('keyup', e => {
            key = e.key.toLowerCase()
            delete keys[key]
            getCurrentPlayer().moving = false
        })
    }
});