var app = new Vue({
    el: '#app',
    data() {
        return {
            socket: {},
            animationStates: [
                { name: 'down', frames: 4 },
                { name: 'left', frames: 4 },
                { name: 'right', frames: 4 },
                { name: 'up', frames: 4 }
            ],
            characters: [
                'starlord',
                'tonystark',
                'thor',
                'rocket',
                'loki',
                'deadpool',
                'captainamerica'
            ],
            isReady: false
        }
    },
    created() {
        this.socket = io('https://gentle-island-28675.herokuapp.com/', { transports: ['websocket'] })
    },
    mounted() {
        var this_ = this
        var socketID
        let firstLoop = true

        // Sprite movement
        const spriteAnimations = [],
            keys = []

        // Multiplayer
        const players = new Object()

        // Load Sprites
        this_.animationStates.forEach((state, i) => {
            let frames = {
                location: []
            }
            for (let j = 0; j < state.frames; j++) {
                let positionX = j * 32
                let positionY = i * 48
                frames.location.push({ x: positionX, y: positionY })
            }
            spriteAnimations[state.name] = frames
        })

        // Game engine
        let fpsInterval, now, then, elapsed,
            fps = 30,
            sprintX = 0

        // Canvas
        let canvas, ctx, canvas_width, canvas_height

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
                if (this_.isReady) {
                    if (firstLoop) {
                        // Execute only first loop
                        canvas = document.getElementById('game')
                        ctx = canvas.getContext('2d')
                        canvas_width = canvas.width = 900
                        canvas_height = canvas.height = 900

                        eventListeners()
                    }
                    firstLoop = false
                    animateSprint()
                }
            }
        }

        function eventListeners() {
            const dropdown = document.getElementById('animations')
            dropdown.addEventListener('change', e => {
                // thisPlayer.sprite_img = 'img/sprite_' + e.target.value + '.png'
            })

            window.addEventListener('keydown', e => {
                key = e.key.toLowerCase()
                keys[key] = true
            })

            window.addEventListener('keyup', e => {
                key = e.key.toLowerCase()
                delete keys[key]
                // thisPlayer.moving = false
            })
        }

        function objectLength(obj) {
            var size = 0,
                key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) size++;
            }
            console.log('length is', size)
            return size;
        }

        function animateSprint() {
            ctx.clearRect(0, 0, canvas_width, canvas_height)
            for (let index = 0; index < objectLength(players); index++) {
                var player = players[socketID],
                    image = new Image()
                image.src = player.sprite_img
                let position = player.moving ? sprintX % spriteAnimations[player.sprite].location.length : 0,
                    frameX = player.sprite_width * position,
                    frameY = spriteAnimations[player.sprite].location[position].y
                ctx.drawImage(image, frameX, frameY, player.sprite_width, player.sprite_height, player.x, player.y, player.width, player.height)
            }
            sprintX++
            moveSprite()
        }

        function moveSprite() {
            // if (keys['w']) {
            //     thisPlayer.y = (thisPlayer.y - thisPlayer.speed) >= 0 ? thisPlayer.y - thisPlayer.speed : thisPlayer.y
            //     thisPlayer.moving = true
            //     thisPlayer.sprite = 'up'
            // }
            // if (keys['s']) {
            //     thisPlayer.y = (thisPlayer.y + thisPlayer.speed) > (canvas_height - thisPlayer.height) ? thisPlayer.y : thisPlayer.y + thisPlayer.speed
            //     thisPlayer.moving = true
            //     thisPlayer.sprite = 'down'
            // }
            // if (keys['a']) {
            //     thisPlayer.x = (thisPlayer.x - thisPlayer.speed) >= 0 ? thisPlayer.x - thisPlayer.speed : thisPlayer.x
            //     thisPlayer.moving = true
            //     thisPlayer.sprite = 'left'
            // }
            // if (keys['d']) {
            //     thisPlayer.x = (thisPlayer.x + thisPlayer.speed) > (canvas_width - thisPlayer.width) ? thisPlayer.x : thisPlayer.x + thisPlayer.speed
            //     thisPlayer.moving = true
            //     thisPlayer.sprite = 'right'
            // }
            if (keys['w'] || keys['s'] || keys['a'] || keys['d']) {
                var data = {
                    id: socketID,
                    w: keys['w'],
                    s: keys['s'],
                    a: keys['a'],
                    d: keys['d'],
                    height: canvas_height,
                    width: canvas_width
                }
                this_.socket.emit('move', data)
            }
        }

        this_.socket.on('update', data => {
            socketID = this.socket.id
            console.log(data[socketID])
        })
    },
    methods: {
        init: function () {
            var this_ = this
            setTimeout(function () {
                /* Wait a bit for the html elements to render */
                this_.isReady = !this_.isReady
                this_.socket.emit('ready')
            }, 10)
        }
    }
});