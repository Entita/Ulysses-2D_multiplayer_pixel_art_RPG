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
        this_.socket.on('position', data => {
            console.log('position changed')
        })

        this_.socket.on('user_connected', () => {
            const otherPlayer = {
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
            otherPlayer.sprite_img.src = 'img/sprite_starlord.png'
            areTherePlayers = true
        })

        this_.socket.on('user_disconnected', () => {
            console.log('player disconnected')
            areTherePlayers = false
        })

        const player = {
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

        // Multiplayer
        areTherePlayers = false

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
            let position = player.moving ? sprintX % spriteAnimations[player.sprite].location.length : 0
            let frameX = player.sprite_width * position
            let frameY = spriteAnimations[player.sprite].location[position].y
            ctx.drawImage(player.sprite_img, frameX, frameY, player.sprite_width, player.sprite_height, player.x, player.y, player.width, player.height)
            if (areTherePlayers) {
                let position = otherPlayer.moving ? sprintX % spriteAnimations[otherPlayer.sprite].location.length : 0
                let frameX = otherPlayer.sprite_width * position
                let frameY = spriteAnimations[otherPlayer.sprite].location[position].y
                ctx.drawImage(otherPlayer.sprite_img, frameX, frameY, otherPlayer.sprite_width, otherPlayer.sprite_height, otherPlayer.x, otherPlayer.y, otherPlayer.width, otherPlayer.height)
            }
            sprintX++
            moveSprite()
        }

        function moveSprite() {
            if (keys['w']) {
                player.y = (player.y - player.speed) >= 0 ? player.y - player.speed : player.y
                player.moving = true
                player.sprite = 'up'
                this_.socket.emit('move', player)
            }
            if (keys['s']) {
                player.y = (player.y + player.speed) > (canvas_height - player.height) ? player.y : player.y + player.speed
                player.moving = true
                player.sprite = 'down'
                this_.socket.emit('move', player)
            }
            if (keys['a']) {
                player.x = (player.x - player.speed) >= 0 ? player.x - player.speed : player.x
                player.moving = true
                player.sprite = 'left'
                this_.socket.emit('move', player)
            }
            if (keys['d']) {
                player.x = (player.x + player.speed) > (canvas_width - player.width) ? player.x : player.x + player.speed
                player.moving = true
                player.sprite = 'right'
                this_.socket.emit('move', player)
            }
        }

        /* Event Listeners */
        const dropdown = document.getElementById('animations')
        dropdown.addEventListener('change', e => {
            player.sprite_img.src = 'img/sprite_' + e.target.value + '.png'
        })

        window.addEventListener('keydown', e => {
            key = e.key.toLowerCase()
            keys[key] = true
        })
        window.addEventListener('keyup', e => {
            key = e.key.toLowerCase()
            delete keys[key]
            player.moving = false
        })
    }
});