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
        var socketID,
            thisPlayer
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

        // All canvases
        let players_canvas, particles_canvas, messages_canvas,
            players_ctx, particles_ctx, messages_ctx,
            canvas_width, canvas_height

        // Particles
        var particles = [];

        startAnimating(fps)

        this_.socket.on('update', data => {
            socketID = this.socket.id
            players = data
            thisPlayer = players[socketID]
        })

        this_.socket.on('player_connected', player => {
            setTimeout(function () {
                playerParticles(player)
            }, 50)
        })

        this_.socket.on('player_disconnected', player => {
            playerParticles(player)
        })

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
                        players_canvas = document.getElementById('players')
                        players_ctx = players_canvas.getContext('2d')
                        particles_canvas = document.getElementById('particles')
                        particles_ctx = particles_canvas.getContext('2d')
                        messages_canvas = document.getElementById('messages')
                        messages_ctx = messages_canvas.getContext('2d')

                        canvas_width = players_canvas.width = particles_canvas.width = messages_canvas.width = 900
                        canvas_height = players_canvas.height = particles_canvas.height = messages_canvas.height = 900

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
            moveSprite()
            drawPlayers()
            drawParticles()
            drawMessages()

            delete pseudoCanvas
            delete pseudoCtx
            sprintX++

            console.log('AAA')
        }

        function drawMessages() {
            if (thisPlayer) {
                messages_ctx.clearRect(0, 0, canvas_width, canvas_height)

                var message = 'Hello World Hello World Hello World Hello World Hello World Hello World Hello World Hello World Hello World Hello World Hello World Hello World Hello World',
                    messages_width = 200,
                    messages_font = 12
                messages_ctx.font = messages_font + 'px pixel'
                messages_ctx.fillStyle = 'black';
                messages_ctx.textAlign = 'center'

                var lines = wrapText(message, messages_width - messages_font);
                lines.forEach(function (line, i) {
                    var player_mid = thisPlayer.width / 2,
                        line_x = thisPlayer.x + player_mid - (messages_width / 2),
                        line_y = ((i + 1) * messages_font) + thisPlayer.y
                    console.log('AAA', messages_width, line_x, thisPlayer.x)
                    messages_ctx.fillText(line, line_x, line_y);
                });
            }
        }

        function wrapText(text, maxWidth) {
            var words = text.split(' '),
                lines = [],
                line = "";
            if (messages_ctx.measureText(text).width < maxWidth) {
                return [text];
            }
            while (words.length > 0) {
                while (messages_ctx.measureText(words[0]).width >= maxWidth) {
                    var tmp = words[0];
                    words[0] = tmp.slice(0, -1);
                    if (words.length > 1) {
                        words[1] = tmp.slice(-1) + words[1];
                    } else {
                        words.push(tmp.slice(-1));
                    }
                }
                if (messages_ctx.measureText(line + words[0]).width < maxWidth) {
                    line += words.shift() + " ";
                } else {
                    lines.push(line);
                    line = "";
                }
                if (words.length === 0) {
                    lines.push(line);
                }
            }
            return lines;
        }

        function drawParticles() {
            particles_ctx.clearRect(0, 0, canvas_width, canvas_height)

            for (let i = 0; i < particles.length; i++) {
                particles[i].draw(particles_ctx)
                if (i === particles.length - 1) {
                    let percent = (Date.now() - particles[i].startTime) / particles[i].animationDuration[i]

                    if (percent > 1) {
                        particles = []
                    }
                }
            }
        }

        function drawPlayers() {
            const pseudoCanvas = document.createElement('canvas')
            pseudoCanvas.width = canvas_width
            pseudoCanvas.height = canvas_height
            pseudoCtx = pseudoCanvas.getContext('2d')
            for (var id in players) {
                if (!players.hasOwnProperty(id)) continue;

                player = players[id]
                var image = sprite_sheet[player.sprite_img]
                let position = player.moving ? sprintX % spriteAnimations[player.sprite].location.length : 0,
                    frameX = player.sprite_width * position,
                    frameY = spriteAnimations[player.sprite].location[position].y
                pseudoCtx.drawImage(image, frameX, frameY, player.sprite_width, player.sprite_height, player.x, player.y, player.width, player.height)
            }

            players_ctx.clearRect(0, 0, canvas_width, canvas_height)
            players_ctx.drawImage(pseudoCanvas, 0, 0)
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

        function createParticleAtPoint(x, y, colorData) {
            let particle = new ExplodingParticle()
            particle.rgbArray = colorData
            particle.startX = x
            particle.startY = y
            particle.startTime = Date.now()

            particles.push(particle)
        }

        function ExplodingParticle() {
            this.animationDuration = 1000
            this.speed = {
                x: -5 + Math.random() * 10,
                y: -5 + Math.random() * 10
            };
            this.size = 4
            this.opacity = 1
            this.life = 30 + Math.random() * 10
            this.remainingLife = this.life

            this.draw = ctx => {
                let p = this

                if (this.remainingLife > 0 && this.size > 0) {
                    ctx.beginPath()
                    ctx.fillRect(p.startX, p.startY, p.size, p.size)
                    ctx.fillStyle = "rgba(" + this.rgbArray[0] + ',' + this.rgbArray[1] + ',' + this.rgbArray[2] + ", " + this.opacity + ")"
                    ctx.fill()

                    p.remainingLife--
                    p.size -= 0.2
                    this.opacity -= 0.05
                    p.startX += p.speed.x
                    p.startY += p.speed.y
                }
            }
        }

        function playerParticles(player) {
            let width = player.width,
                height = player.height,
                colorData = players_ctx.getImageData(player.x, player.y, width, height).data

            for (let localX = 0; localX < width; localX++) {
                for (let localY = 0; localY < height; localY++) {
                    let index = (localY * width + localX) * 4
                    let rgbaColorArr = colorData.slice(index, index + 4)
                    if (rgbaColorArr[0] == 0 && rgbaColorArr[1] == 0 && rgbaColorArr[2] == 0) {
                        continue
                    }

                    let globalX = player.x + localX
                    let globalY = player.y + localY

                    createParticleAtPoint(globalX, globalY, rgbaColorArr)
                }
            }
        }
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