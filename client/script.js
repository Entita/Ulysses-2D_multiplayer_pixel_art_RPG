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
        let socket_id
        // Socket.io
        this_.socket.on('connect', () => {
            socket_id = this_.socket.id
        })

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

            otherPlayer.push(player)
        })

        this_.socket.on('user_disconnected', socket => {
            console.log('player disconnected', socket)
            console.log(otherPlayer)
            otherPlayer = otherPlayer.filter(item => item.socket_id !== socket)
            console.log(otherPlayer)
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

        // Load Sprites
        this_.animationStates.forEach((state, i) => {
            let frames = {
                location: []
            }
            for (let j = 0; j < state.frames; j++) {
                let positionX = j * otherPlayer[0].sprite_width
                let positionY = i * otherPlayer[0].sprite_height
                frames.location.push({ x: positionX, y: positionY })
            }
            spriteAnimations[state.name] = frames
        })

        // Multiplayer
        var otherPlayer = []

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
            for (let index = 0; index < otherPlayer.length; index++) {
                let position = otherPlayer[index].moving ? sprintX % spriteAnimations[otherPlayer[index].sprite].location.length : 0
                let frameX = otherPlayer[index].sprite_width * position
                let frameY = spriteAnimations[otherPlayer[index].sprite].location[position].y
                ctx.drawImage(otherPlayer[index].sprite_img, frameX, frameY, otherPlayer[index].sprite_width, otherPlayer[index].sprite_height, otherPlayer[index].x, otherPlayer[index].y, otherPlayer[index].width, otherPlayer[index].height)
            }
            sprintX++
            moveSprite()
        }

        function moveSprite() {
            if (keys['w']) {
                otherPlayer[0].y = (otherPlayer[0].y - otherPlayer[0].speed) >= 0 ? otherPlayer[0].y - otherPlayer[0].speed : otherPlayer[0].y
                otherPlayer[0].moving = true
                otherPlayer[0].sprite = 'up'
                this_.socket.emit('move', player)
            }
            if (keys['s']) {
                otherPlayer[0].y = (otherPlayer[0].y + otherPlayer[0].speed) > (canvas_height - otherPlayer[0].height) ? otherPlayer[0].y : otherPlayer[0].y + otherPlayer[0].speed
                otherPlayer[0].moving = true
                otherPlayer[0].sprite = 'down'
                this_.socket.emit('move', player)
            }
            if (keys['a']) {
                otherPlayer[0].x = (otherPlayer[0].x - otherPlayer[0].speed) >= 0 ? otherPlayer[0].x - otherPlayer[0].speed : otherPlayer[0].x
                otherPlayer[0].moving = true
                otherPlayer[0].sprite = 'left'
                this_.socket.emit('move', player)
            }
            if (keys['d']) {
                otherPlayer[0].x = (otherPlayer[0].x + otherPlayer[0].speed) > (canvas_width - otherPlayer[0].width) ? otherPlayer[0].x : otherPlayer[0].x + otherPlayer[0].speed
                otherPlayer[0].moving = true
                otherPlayer[0].sprite = 'right'
                this_.socket.emit('move', player)
            }
        }

        /* Event Listeners */
        const dropdown = document.getElementById('animations')
        dropdown.addEventListener('change', e => {
            otherPlayer[0].sprite_img.src = 'img/sprite_' + e.target.value + '.png'
        })

        window.addEventListener('keydown', e => {
            key = e.key.toLowerCase()
            keys[key] = true
        })
        window.addEventListener('keyup', e => {
            key = e.key.toLowerCase()
            delete keys[key]
            otherPlayer[0].moving = false
        })
    }
});