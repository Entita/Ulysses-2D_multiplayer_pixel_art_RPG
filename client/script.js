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
        var players = new Object()

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
                var data = {
                    id: socketID,
                    img: 'img/sprite_' + e.target.value + '.png'
                }
                this_.socket.emit('skin', data)
            })

            window.addEventListener('keydown', e => {
                key = e.key.toLowerCase()
                keys[key] = true
            })

            window.addEventListener('keyup', e => {
                key = e.key.toLowerCase()
                delete keys[key]
                this_.socket.emit('stopped', socketID)
            })
        }

        function animateSprint() {
            // Double buffering appears, caused by slow drawing, can be fixed by clearing canvas after I already got new canvas drawn
            ctx.clearRect(0, 0, canvas_width, canvas_height)

            const pseudoCanvas = document.createElement('canvas')
            pseudoCanvas.width = canvas_width
            pseudoCanvas.height = canvas_height
            pseudoCtx = pseudoCanvas.getContext('2d')
            for (var id in players) {
                // skip loop if the property is from prototype
                if (!players.hasOwnProperty(id)) continue;

                player = players[id]
                var image = new Image()
                image.src = player.sprite_img
                let position = player.moving ? sprintX % spriteAnimations[player.sprite].location.length : 0,
                    frameX = player.sprite_width * position,
                    frameY = spriteAnimations[player.sprite].location[position].y
                pseudoCtx.drawImage(image, frameX, frameY, player.sprite_width, player.sprite_height, player.x, player.y, player.width, player.height)
            }

            ctx.drawImage(pseudoCanvas, 0, 0)

            sprintX++
            moveSprite()
        }

        function moveSprite() {
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
            players = data
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