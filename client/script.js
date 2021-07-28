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
        this.animationStates = [
            { name: 'idle', frames: 7 },
            { name: 'jump', frames: 7 },
            { name: 'fall', frames: 7 },
            { name: 'run', frames: 9 },
            { name: 'dizzy', frames: 11 },
            { name: 'sit', frames: 5 },
            { name: 'roll', frames: 7 },
            { name: 'bite', frames: 7 },
            { name: 'ko', frames: 12 },
            { name: 'hit', frames: 4 }
        ]
    },
    mounted() {
        // this.socket.on('position', data => {
        //     var board = document.getElementById('game')
        //     this.context.clearRect(0, 0, board.width, board.height)
        //     // this.context.fillRect(data.x, data.y, 20, 20)
        // })

        const player = {
            sprite: 'idle',
            x: 0,
            y: 0,
            sprite_src: 'img/sprite_sheet.png',
            sprite_img: new Image(),
            sprite_width: 575,
            sprite_height: 523,
            width: 100,
            height: Math.round(width * 0.9096),
            // height: 92,
            speed: 10,
            moving: false
        }

        player.sprite_img.src = 'img/sprite_sheet.png'

        // Canvas
        const canvas = document.getElementById('game')
        const ctx = canvas.getContext('2d')
        const canvas_width = canvas.width = 900
        const canvas_height = canvas.height = 900

        let gameFrame = 0
        const staggerFrames = 6
        const spriteAnimations = []
        const keys = []

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
        })

        animate()

        /* Functions */
        function animate() {
            ctx.clearRect(0, 0, canvas_width, canvas_height)
            let position = Math.floor(gameFrame / staggerFrames) % spriteAnimations[player.sprite].location.length
            let frameX = player.sprite_width * position
            let frameY = spriteAnimations[player.sprite].location[position].y
            ctx.drawImage(player.sprite_img, frameX, frameY, player.sprite_width, player.sprite_height, player.x, player.y, player.width, player.height)

            gameFrame++
            moveSprite()
            requestAnimationFrame(animate)
        }

        function moveSprite() {
            if (keys['w']) {
                player.y = (player.y - player.speed) >= 0 ? player.y - player.speed : player.y
                player.moving = true
            }
            if (keys['s']) {
                player.y = (player.y + player.speed) > (canvas_height - player.width) ? player.y : player.y + player.speed
                player.moving = true
            }
            if (keys['a']) {
                player.x = (player.x - player.speed) >= 0 ? player.x - player.speed : player.x
                player.moving = true
            }
            if (keys['d']) {
                player.x = (player.x + player.speed) > (canvas_width - player.width) ? player.x : player.x + player.speed
                player.moving = true
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
        })
        window.addEventListener('keyup', e => {
            key = e.key.toLowerCase()
            delete keys[key]
            player.moving = false
        })
    },
    methods: {

    }
});