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

        // Sprite movement
        const spriteAnimations = [],
            keys = []

        // Multiplayer
        var players = []

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
                if (this.isReady) {
                    console.log('draw sprint')
                } {
                    console.log('not ready yet')
                }
                // animateSprint()
            }
        }

        // /* Functions */
        // // function doPlayerUpdate(player) {
        // //     this_.socket.emit('update_player', player)
        // // }

        // function animateSprint() {
        //     ctx.clearRect(0, 0, canvas_width, canvas_height)
        //     for (let index = 0; index < players.length; index++) {
        //         let position = players[index].moving ? sprintX % spriteAnimations[players[index].sprite].location.length : 0
        //         let frameX = players[index].sprite_width * position
        //         let frameY = spriteAnimations[players[index].sprite].location[position].y
        //         var image = new Image()
        //         image.src = players[index].sprite_img
        //         ctx.drawImage(image, frameX, frameY, players[index].sprite_width, players[index].sprite_height, players[index].x, players[index].y, players[index].width, players[index].height)
        //     }
        //     sprintX++
        //     moveSprite()
        // }

        // // function movingSprint(player, dir) {
        // //     player.moving = true
        // //     player.sprite = dir
        // //     this_.socket.emit('move', players)
        // // }

        // function moveSprite() {
        //     if (keys['w']) {
        //         // var thisPlayer = players[getCurrentPlayerIndex()]
        //         thisPlayer.y = (thisPlayer.y - thisPlayer.speed) >= 0 ? thisPlayer.y - thisPlayer.speed : thisPlayer.y
        //         // movingSprint(thisPlayer, 'up')
        //         // doPlayerUpdate(thisPlayer)
        //     }
        //     if (keys['s']) {
        //         // var thisPlayer = players[getCurrentPlayerIndex()]
        //         thisPlayer.y = (thisPlayer.y + thisPlayer.speed) > (canvas_height - thisPlayer.height) ? thisPlayer.y : thisPlayer.y + thisPlayer.speed
        //         // movingSprint(thisPlayer, 'down')
        //         // doPlayerUpdate(thisPlayer)
        //     }
        //     if (keys['a']) {
        //         // var thisPlayer = players[getCurrentPlayerIndex()]
        //         thisPlayer.x = (thisPlayer.x - thisPlayer.speed) >= 0 ? thisPlayer.x - thisPlayer.speed : thisPlayer.x
        //         // movingSprint(thisPlayer, 'left')
        //         // doPlayerUpdate(thisPlayer)
        //     }
        //     if (keys['d']) {
        //         // var thisPlayer = players[getCurrentPlayerIndex()]
        //         thisPlayer.x = (thisPlayer.x + thisPlayer.speed) > (canvas_width - thisPlayer.width) ? thisPlayer.x : thisPlayer.x + thisPlayer.speed
        //         // movingSprint(thisPlayer, 'right')
        //         // doPlayerUpdate(thisPlayer)
        //     }
        // }

        // // function getCurrentPlayerIndex() {
        // //     return players.findIndex((obj => obj.socket_id == socketID))
        // // }

        // /* Event Listeners */
        // const dropdown = document.getElementById('animations')
        // dropdown.addEventListener('change', e => {
        //     // var thisPlayer = players[getCurrentPlayerIndex()]
        //     thisPlayer.sprite_img = 'img/sprite_' + e.target.value + '.png'
        //     // doPlayerUpdate(thisPlayer)
        // })

        // window.addEventListener('keydown', e => {
        //     key = e.key.toLowerCase()
        //     keys[key] = true
        // })
        // window.addEventListener('keyup', e => {
        //     key = e.key.toLowerCase()
        //     delete keys[key]
        //     // var thisPlayer = players[getCurrentPlayerIndex()]
        //     thisPlayer.moving = false
        //     // doPlayerUpdate(thisPlayer)
        // })

        this_.socket.on('update', data => {
            console.log(data)
        })
    },
    methods: {
        init: function () {
            this.isReady = !this.isReady
            this.socket.emit('ready')
            setTimeout(function () {
                /* Wait a bit for the html elements to render */
                // Canvas
                const canvas = document.getElementById('game'),
                    ctx = canvas.getContext('2d'),
                    canvas_width = canvas.width = 900,
                    canvas_height = canvas.height = 900

                // Game engine
                let fpsInterval, now, then, elapsed,
                    fps = 30,
                    sprintX = 0
            }, 50)
        }
    }
});