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
            messages: '',
            isReady: false
        }
    },
    created() {
        this.socket = io('https://gentle-island-28675.herokuapp.com/', { transports: ['websocket'] })
    },
    mounted() {
        var this_ = this,
            firstLoop = true,
            socketID

        // Pre-rendering all sprites images
        const sprite_sheet = {
            'starlord': new Image(),
            'tonystark': new Image(),
            'thor': new Image(),
            'rocket': new Image(),
            'loki': new Image(),
            'deadpool': new Image(),
            'captainamerica': new Image()
        },
            world_sheet = new Image()

        sprite_sheet['starlord'].src = 'img/sprite_starlord.png'
        sprite_sheet['tonystark'].src = 'img/sprite_tonystark.png'
        sprite_sheet['thor'].src = 'img/sprite_thor.png'
        sprite_sheet['rocket'].src = 'img/sprite_rocket.png'
        sprite_sheet['loki'].src = 'img/sprite_loki.png'
        sprite_sheet['deadpool'].src = 'img/sprite_deadpool.png'
        sprite_sheet['captainamerica'].src = 'img/sprite_captainamerica.png'

        world_sheet.src = 'img/world_sheet.png'

        // Sprite movement
        const spriteAnimations = [],
            keys = []

        // Multiplayer
        var players = new Object(),
            messages = new Object(),
            map = new Object(),
            collapsibles = new Object()

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
        let players_canvas, particles_canvas, messages_canvas, world_canvas, collision_canvas,
            players_ctx, particles_ctx, messages_ctx, world_ctx, collision_ctx,
            canvas_width, canvas_height

        // Particles
        var particles = [];

        startAnimating(fps)

        this_.socket.on('world', server_map => {
            map = server_map
            drawMap()
        })

        this_.socket.on('update_players', data => {
            socketID = this.socket.id
            players = data
        })

        this_.socket.on('update_messages', data => {
            messages = data
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
                        world_canvas = document.getElementById('world')
                        world_ctx = world_canvas.getContext('2d')
                        collision_canvas = document.getElementById('collisions')
                        collision_ctx = collision_canvas.getContext('2d')

                        canvas_width = players_canvas.width = particles_canvas.width = messages_canvas.width = world_canvas.width = collision_canvas.width = 900
                        canvas_height = players_canvas.height = particles_canvas.height = messages_canvas.height = world_canvas.height = collision_canvas.height = 900

                        eventListeners()
                    }
                    firstLoop = false
                    animateSprint()
                }
            }
        }

        function eventListeners() {
            const dropdown = document.getElementById('animations'),
                messageInput = document.querySelector('.messageInput'),
                messageBtn = document.querySelector('.messageBtn')
            dropdown.addEventListener('change', e => {
                var data = {
                    id: socketID,
                    img: e.target.value
                }
                this_.socket.emit('skin', data)
            })

            window.addEventListener('keydown', e => {
                if (document.activeElement != messageInput) {
                    key = e.key.toLowerCase()
                    keys[key] = true
                }
            })

            window.addEventListener('keyup', e => {
                if (document.activeElement != messageInput) {
                    key = e.key.toLowerCase()
                    delete keys[key]
                    this_.socket.emit('stopped', socketID)
                } else {
                    messageInput.value = messageInput.value.normalize("NFD").replace(/\p{Diacritic}/gu, "")
                    if (e.key === 'Enter') {
                        sendMessage(messageInput)
                    }
                }
            })

            messageBtn.addEventListener('click', () => {
                sendMessage(messageInput)
            })
        }

        function sendMessage(messageInput) {
            if (messageInput.value.length > 0) {
                var data = {
                    id: socketID,
                    message: messageInput.value,
                    time: Date.now()
                }
                this_.socket.emit('message', data)
                messageInput.value = null
            }
        }

        function animateSprint() {
            moveSprite()
            drawPlayers()
            drawParticles()
            drawMessages()
            sprintX++
        }

        function drawMap() {
            var width = map.length,
                height = map[0].length,
                squareSize = 50

            const pseudoCanvas = document.createElement('canvas')
            pseudoCanvas.width = canvas_width
            pseudoCanvas.height = canvas_height
            pseudoCtx = pseudoCanvas.getContext('2d')

            collision_ctx.clearRect(0, 0, canvas_width, canvas_height)
            for (let x = 0; x < width; x++) {
                for (let y = 0; y < height; y++) {
                    var coord_x = x * squareSize,
                        coord_y = y * squareSize
                    if (map[x][y] === 1) {
                        pseudoCtx.drawImage(world_sheet, 32, 0, 32, 32, coord_x, coord_y, squareSize, squareSize)
                        var o = Math.round, r = Math.random, s = 255,
                            random_rgb = 'rgb(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ')'
                        while (random_rgb === 'rgb(0,0,0)' && !collapsibles[random_rgb]) {
                            random_rgb = 'rgb(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ')'
                        }
                        collision_ctx.strokeStyle = random_rgb
                        collision_ctx.strokeRect(coord_x, coord_y, squareSize, squareSize)
                        collapsibles[random_rgb] = {
                            id: random_rgb,
                            name: 'rock',
                            x: coord_x,
                            y: coord_y,
                            width: squareSize,
                            height: squareSize
                        }
                    } else {
                        pseudoCtx.drawImage(world_sheet, 0, 0, 32, 32, coord_x, coord_y, squareSize, squareSize)
                    }
                }
            }

            world_ctx.clearRect(0, 0, canvas_width, canvas_height)
            world_ctx.drawImage(pseudoCanvas, 0, 0)

            delete pseudoCanvas
            delete pseudoCtx
        }

        function drawMessages() {
            const pseudoCanvas = document.createElement('canvas')
            pseudoCanvas.width = canvas_width
            pseudoCanvas.height = canvas_height
            pseudoCtx = pseudoCanvas.getContext('2d')

            var border = 4,
                messages_width = 120,
                messages_font = 12

            for (var id in messages) {
                if (!messages.hasOwnProperty(id)) continue;

                var message = messages[id]
                let message_time = (Date.now() - message.time) / 6000

                if (message_time > 1 || players[id] === undefined) {
                    delete messages[id]
                } else {
                    var lines = wrapText(message.text, messages_width - messages_font),
                        messages_height = messages_font * lines.length
                    var tempText, tempIndex

                    const tempConvas = document.createElement('canvas')
                    tempConvas.width = canvas_width
                    tempConvas.height = canvas_height
                    tempCtx = tempConvas.getContext('2d')

                    tempCtx.font = messages_font + 'px pixel'
                    tempCtx.fillStyle = 'black'
                    tempCtx.textAlign = 'center'

                    lines.forEach(function (line, i) {
                        var line_x = (players[id].width / 2) + players[id].x,
                            line_y = ((i + 1) * messages_font) + players[id].y - messages_height
                        line_x = players[id].sprite === 'left' ? line_x - border * 10 : line_x + border * 10
                        tempCtx.fillText(line, line_x, line_y)
                        tempText = line
                        tempIndex = i
                    });
                    drawSpeechBubble(players[id].x, players[id].y, messages_height, tempText, tempIndex, players[id].width, border, players[id].sprite)
                    pseudoCtx.drawImage(tempConvas, 0, - border * 9)
                }
            }
            messages_ctx.clearRect(0, 0, canvas_width, canvas_height)
            messages_ctx.drawImage(pseudoCanvas, 0, 0)


            delete pseudoCanvas
            delete pseudoCtx
        }

        function drawSpeechBubble(x, y, height, text, index, player_width, border, dir) {
            var width = index > 0 ? 200 : pseudoCtx.measureText(text).width + border * 10,
                width = width > 200 ? 200 : width
            offset = dir === 'left' ? -40 : 40

            // Adding minimal width & height
            width = width <= 80 ? 80 : width
            height = height <= 20 ? 20 : height

            // Bubble border
            pseudoCtx.fillStyle = 'black'
            pseudoCtx.fillRect(x + offset + player_width / 2 - width / 2 + border / 2, y - height - border * 10, width, border)
            pseudoCtx.fillRect(x + offset + player_width / 2 - width / 2 - border / 2, y - height - border * 9, border, border)
            pseudoCtx.fillRect(x + offset + player_width / 2 + width / 2 + border / 2, y - height - border * 9, border, border)
            pseudoCtx.fillRect(x + offset + player_width / 2 - width / 2 - border - border / 2, y - height - border * 8, border, height)
            pseudoCtx.fillRect(x + offset + player_width / 2 + width / 2 + border + border / 2, y - height - border * 8, border, height)
            pseudoCtx.fillRect(x + offset + player_width / 2 - width / 2 - border / 2, y - border * 8, border, border)
            pseudoCtx.fillRect(x + offset + player_width / 2 + width / 2 + border / 2, y - border * 8, border, border)
            pseudoCtx.fillRect(x + offset + player_width / 2 - width / 2 + border / 2, y - border * 7, width, border)

            // Tail + tail white fill + shadow
            pseudoCtx.fillStyle = 'black'
            if (offset < 0) {
                // Tail border
                pseudoCtx.fillRect(x + player_width / 2 - border * 6, y - border * 6, border, border * 2)
                pseudoCtx.fillRect(x + player_width / 2 - border * 2, y - border * 6, border, border * 2)
                pseudoCtx.fillRect(x + player_width / 2 - border, y - border * 4, border, border * 3)
                pseudoCtx.fillRect(x + player_width / 2 - border * 5, y - border * 4, border, border)
                pseudoCtx.fillRect(x + player_width / 2 - border * 4, y - border * 3, border, border)
                pseudoCtx.fillRect(x + player_width / 2 - border * 3, y - border * 2, border * 2, border)
                pseudoCtx.fillRect(x + player_width / 2, y - border, border, border)

                // Shadow
                pseudoCtx.fillStyle = 'rgba(0,0,0,.25)'
                pseudoCtx.fillRect(x + offset + player_width / 2 + width / 2 + border / 2 + border * 2, y - border * 7 - height, border, height)
                pseudoCtx.fillRect(x + offset + player_width / 2 + width / 2 + border / 2 + border, y - border * 8, border, border * 2)
                pseudoCtx.fillRect(x + offset + player_width / 2 + width / 2 + border / 2, y - border * 7, border, border * 2)
                pseudoCtx.fillRect(x + offset + player_width / 2 - width / 2 + border / 2 + border, y - border * 6, width - border, border)

                pseudoCtx.fillRect(x + player_width / 2 - border, y - border * 5, border, border)
                pseudoCtx.fillRect(x + player_width / 2, y - border * 4, border, border * 3)
                pseudoCtx.fillRect(x + player_width / 2 - border * 2, y - border * 1, border * 2, border)

                // Tail white fill
                pseudoCtx.fillStyle = 'white'
                pseudoCtx.fillRect(x + player_width / 2 - border * 5, y - border * 7, border * 3, border * 3)
                pseudoCtx.fillRect(x + player_width / 2 - border * 4, y - border * 4, border * 3, border)
                pseudoCtx.fillRect(x + player_width / 2 - border * 3, y - border * 3, border * 2, border)
            } else {
                // Tail border
                pseudoCtx.fillRect(x + player_width / 2 + border * 6, y - border * 6, border, border * 2)
                pseudoCtx.fillRect(x + player_width / 2 + border * 2, y - border * 6, border, border * 2)
                pseudoCtx.fillRect(x + player_width / 2 + border, y - border * 4, border, border * 3)
                pseudoCtx.fillRect(x + player_width / 2 + border * 5, y - border * 4, border, border)
                pseudoCtx.fillRect(x + player_width / 2 + border * 4, y - border * 3, border, border)
                pseudoCtx.fillRect(x + player_width / 2 + border * 2, y - border * 2, border * 2, border)
                pseudoCtx.fillRect(x + player_width / 2, y - border, border, border)

                // Shadow
                pseudoCtx.fillStyle = 'rgba(0,0,0,.25)'
                pseudoCtx.fillRect(x + offset + player_width / 2 - width / 2 + border / 2 - border * 3, y - border * 7 - height, border, height)
                pseudoCtx.fillRect(x + offset + player_width / 2 - width / 2 + border / 2 - border * 2, y - border * 8, border, border * 2)
                pseudoCtx.fillRect(x + offset + player_width / 2 - width / 2 + border / 2 - border, y - border * 7, border, border * 2)
                pseudoCtx.fillRect(x + offset + player_width / 2 - width / 2 + border / 2 - border + border, y - border * 6, width - border, border)

                pseudoCtx.fillRect(x + player_width / 2 + border, y - border * 5, border, border)
                pseudoCtx.fillRect(x + player_width / 2, y - border * 4, border, border * 3)
                pseudoCtx.fillRect(x + player_width / 2 + border, y - border * 1, border * 2, border)

                // Tail white fill
                pseudoCtx.fillStyle = 'white'
                pseudoCtx.fillRect(x + player_width / 2 + border * 3, y - border * 7, border * 3, border * 3)
                pseudoCtx.fillRect(x + player_width / 2 + border * 2, y - border * 4, border * 3, border)
                pseudoCtx.fillRect(x + player_width / 2 + border * 2, y - border * 3, border * 2, border)
            }
            // Bubble white fill
            pseudoCtx.fillStyle = 'white'
            pseudoCtx.fillRect(x + offset + player_width / 2 - width / 2 + border / 2, y - border * 8, width, border)
            pseudoCtx.fillRect(x + offset + player_width / 2 - width / 2 + border / 2, y - border * 9 - height, width, border)
            pseudoCtx.fillRect(x + offset + player_width / 2 - width / 2 + border / 2 - border, y - border * 8 - height, width + border * 2, height)
        }

        function wrapText(text, maxWidth) {
            var words = text.split(' '),
                lines = [],
                line = "";
            if (pseudoCtx.measureText(text).width < maxWidth) {
                return [text];
            }
            while (words.length > 0) {
                while (pseudoCtx.measureText(words[0]).width >= maxWidth) {
                    var tmp = words[0];
                    words[0] = tmp.slice(0, -1);
                    if (words.length > 1) {
                        words[1] = tmp.slice(-1) + words[1];
                    } else {
                        words.push(tmp.slice(-1));
                    }
                }
                if (pseudoCtx.measureText(line + words[0]).width < maxWidth) {
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

                // Player hitbox
                pseudoCtx.strokeStyle = 'red'
                pseudoCtx.strokeRect(player.x, player.y, player.width, player.height)
            }

            players_ctx.clearRect(0, 0, canvas_width, canvas_height)
            players_ctx.drawImage(pseudoCanvas, 0, 0)

            delete pseudoCanvas
            delete pseudoCtx
        }

        function moveSprite() {
            if ((keys['w'] || keys['s'] || keys['a'] || keys['d']) && validMove(players[socketID].x, players[socketID].y, keys)) {
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

        function validMove(x, y, keys) {
            function collapse(left, mid, right) {
                if ((left[0] === 0 && left[1] === 1 && left[2] === 0) ||
                    (mid[0] === 0 && mid[1] === 1 && mid[2] === 0) ||
                    (right[0] === 0 && right[1] === 1 && right[2] === 0)) {
                    return false
                }
                return true
            }
            if (keys['w']) {
                var leftColor = collision_ctx.getImageData(x, y - 1, 1, 1).data,
                    midColor = collision_ctx.getImageData(x + players[socketID].width / 2, y - 1, 1, 1).data,
                    rightColor = collision_ctx.getImageData(x + players[socketID].width, y - 1, 1, 1).data
                return collapse(leftColor, midColor, rightColor)
            }
            // } else if (keys['s']) {
            //     var color = collision_ctx.getImageData(x, y + 1, 1, 1)
            //     return true
            // } else if (keys['a']) {
            //     var color = collision_ctx.getImageData(x - 1, y, 1, 1)
            //     return true
            // } else if (keys['d']) {
            //     var color = collision_ctx.getImageData(x + 1, y - 1, 1, 1)
            //     return true
            // } else {
            //     return false
            // }
            return true
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