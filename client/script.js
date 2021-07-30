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

        // Pre-rendering all sprites images
        const sprite_sheet = {
            'starlord': new Image(),
            'tonystark': new Image(),
            'thor': new Image(),
            'rocket': new Image(),
            'loki': new Image(),
            'deadpool': new Image(),
            'captainamerica': new Image()
        }
        sprite_sheet['starlord'].src = 'img/sprite_starlord.png'
        sprite_sheet['tonystark'].src = 'img/sprite_tonystark.png'
        sprite_sheet['thor'].src = 'img/sprite_thor.png'
        sprite_sheet['rocket'].src = 'img/sprite_rocket.png'
        sprite_sheet['loki'].src = 'img/sprite_loki.png'
        sprite_sheet['deadpool'].src = 'img/sprite_deadpool.png'
        sprite_sheet['captainamerica'].src = 'img/sprite_captainamerica.png'

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
                    img: e.target.value
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
            // Implemented double buffering
            moveSprite()
            const pseudoCanvas = document.createElement('canvas')
            pseudoCanvas.width = canvas_width
            pseudoCanvas.height = canvas_height
            pseudoCtx = pseudoCanvas.getContext('2d')
            for (var id in players) {
                // skip loop if the property is from prototype
                if (!players.hasOwnProperty(id)) continue;

                player = players[id]
                var image = sprite_sheet[player.sprite_img]
                let position = player.moving ? sprintX % spriteAnimations[player.sprite].location.length : 0,
                    frameX = player.sprite_width * position,
                    frameY = spriteAnimations[player.sprite].location[position].y
                pseudoCtx.drawImage(image, frameX, frameY, player.sprite_width, player.sprite_height, player.x, player.y, player.width, player.height)
            }

            ctx.clearRect(0, 0, canvas_width, canvas_height)
            ctx.drawImage(pseudoCanvas, 0, 0)
            delete pseudoCanvas
            delete pseudoCtx

            sprintX++
        }

        function moveSprite() {
            if (keys['w'] || keys['s'] || keys['a'] || keys['d']) {
                var player = players[socketID]
                var data = {
                    id: socketID,
                    w: [keys['w'], (player.y - player.speed) >= 0 ? player.y - player.speed : player.y],
                    s: [keys['s'], (player.y + player.speed) > (canvas_height - player.height) ? player.y : player.y + player.speed],
                    a: [keys['a'], (player.x - player.speed) >= 0 ? player.x - player.speed : player.x],
                    d: [keys['d'], (player.x + player.speed) > (canvas_width - player.width) ? player.x : player.x + player.speed]
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