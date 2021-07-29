var app = new Vue({
    el: '#app',
    data() {
        return {
            socket: {},
            animationStates: []
        }
    },
    created() {
        this.socket = io('https://gentle-island-28675.herokuapp.com/', { transports: ['websocket'] })
        // this.animationStates = [
        //     { name: 'idle', frames: 7 },
        //     { name: 'jump', frames: 7 },
        //     { name: 'fall', frames: 7 },
        //     { name: 'run', frames: 9 },
        //     { name: 'dizzy', frames: 11 },
        //     { name: 'sit', frames: 5 },
        //     { name: 'roll', frames: 7 },
        //     { name: 'bite', frames: 7 },
        //     { name: 'ko', frames: 12 },
        //     { name: 'hit', frames: 4 }
        // ]
        this.animationStates = [
            { name: 'up', frames: 4 },
            { name: 'down', frames: 4 },
            { name: 'left', frames: 4 },
            { name: 'right', frames: 4 }
        ]
    },
    mounted() {
        // this.socket.on('position', data => {
        //     var board = document.getElementById('game')
        //     this.context.clearRect(0, 0, board.width, board.height)
        //     // this.context.fillRect(data.x, data.y, 20, 20)
        // })

        const player = {
            // sprite: 'idle',
            sprite: 'down',
            spriteDir: 0,
            x: 0,
            y: 0,
            sprite_src: 'img/sprite_sheet.png',
            sprite_img: new Image(),
            sprite_width: 1024,
            sprite_height: 1024,
            width: 256,
            height: 256,
            speed: 10,
            moving: false
        }
        // player.sprite_img.src = 'img/sprite_sheet.png'
        player.sprite_img.src = 'img/sprite_boy.png'

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
        this.animationStates.forEach((state, i) => {
            let frames = {
                location: []
            }
            for (let j = 0; j < state.frames; j++) {
                let positionX = j * player.sprite_width
                let positionY = i * player.sprite_height
                frames.location.push({ x: positionX, y: positionY })
            }
            spriteAnimations[state.name] = frames
            console.log(spriteAnimations)
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

                animateSprint()
            }
        }

        /* Functions */
        function animateSprint() {
            ctx.clearRect(0, 0, canvas_width, canvas_height)
            let position = 0
            if (player.moving) {
                position = sprintX % spriteAnimations[player.sprite].location.length
            }
            console.log(position, spriteAnimations[player.sprite])
            let frameX = player.sprite_width * position
            let frameY = spriteAnimations[player.sprite].location[position].y
            ctx.drawImage(player.sprite_img, frameX, frameY, player.sprite_width, player.sprite_height, player.x, player.y, player.width, player.height)

            sprintX++
            moveSprite()
        }

        function moveSprite() {
            if (keys['w']) {
                player.y = (player.y - player.speed) >= 0 ? player.y - player.speed : player.y
                player.moving = true
                player.sprite = 'up'
            }
            if (keys['s']) {
                player.y = (player.y + player.speed) > (canvas_height - player.width) ? player.y : player.y + player.speed
                player.moving = true
                player.sprite = 'down'
            }
            if (keys['a']) {
                player.x = (player.x - player.speed) >= 0 ? player.x - player.speed : player.x
                player.moving = true
                player.sprite = 'left'
            }
            if (keys['d']) {
                player.x = (player.x + player.speed) > (canvas_width - player.width) ? player.x : player.x + player.speed
                player.moving = true
                player.sprite = 'right'
            }
        }

        /* Event Listeners */
        const dropdown = document.getElementById('animations')
        dropdown.addEventListener('change', function (e) {
            player.sprite = e.target.value
        })

        window.addEventListener('keydown', e => {
            key = e.key.toLowerCase()
            keys[key] = true
            player.moving = true
            player.sprite = 'run'
        })
        window.addEventListener('keyup', e => {
            key = e.key.toLowerCase()
            delete keys[key]
            player.moving = false
            player.sprite = 'idle'
        })
    },
    methods: {

    }
});