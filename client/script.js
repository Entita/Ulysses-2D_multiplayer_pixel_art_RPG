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
        // Socket.io
        this_.socket.on('position', data => {
            console.log('position changed', data)
        })

        this_.socket.on('user_connected', socket => {
            console.log('player connected', socket)
            const player = {
                socket_id: socket,
                sprite: 'down',
                spriteDir: 0,
                x: 0,
                y: 0,
                sprite_img: new Image(),
                sprite_width: 32,
                sprite_height: 48,
                width: 67,
                height: 100,
                speed: 10,
                moving: false
            }
            player.sprite_img.src = 'img/sprite_starlord.png'

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

        this_.socket.on('user_disconnected', socket => {
            console.log('player disconnected', socket)
            players = players.filter(item => item.socket_id !== socket)
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
                ctx.drawImage(players[index].sprite_img, frameX, frameY, players[index].sprite_width, players[index].sprite_height, players[index].x, players[index].y, players[index].width, players[index].height)
            }
            sprintX++
            moveSprite()
        }

        function moveSprite() {
            if (keys['w']) {
                players[0].y = (players[0].y - players[0].speed) >= 0 ? players[0].y - players[0].speed : players[0].y
                players[0].moving = true
                players[0].sprite = 'up'
                this_.socket.emit('move', players)
            }
            if (keys['s']) {
                players[0].y = (players[0].y + players[0].speed) > (canvas_height - players[0].height) ? players[0].y : players[0].y + players[0].speed
                players[0].moving = true
                players[0].sprite = 'down'
                this_.socket.emit('move', players)
            }
            if (keys['a']) {
                players[0].x = (players[0].x - players[0].speed) >= 0 ? players[0].x - players[0].speed : players[0].x
                players[0].moving = true
                players[0].sprite = 'left'
                this_.socket.emit('move', players)
            }
            if (keys['d']) {
                players[0].x = (players[0].x + players[0].speed) > (canvas_width - players[0].width) ? players[0].x : players[0].x + players[0].speed
                players[0].moving = true
                players[0].sprite = 'right'
                this_.socket.emit('move', players)
            }
        }

        /* Event Listeners */
        const dropdown = document.getElementById('animations')
        dropdown.addEventListener('change', e => {
            players[0].sprite_img.src = 'img/sprite_' + e.target.value + '.png'
        })

        window.addEventListener('keydown', e => {
            key = e.key.toLowerCase()
            keys[key] = true
        })
        window.addEventListener('keyup', e => {
            key = e.key.toLowerCase()
            delete keys[key]
            players[0].moving = false
        })
    }
});