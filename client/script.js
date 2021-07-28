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

        let playerState = 'idle'
        let coordX = 0
        let coordY = 0

        // Canvas
        const canvas = document.getElementById('game')
        const ctx = canvas.getContext('2d')
        const canvas_width = canvas.width = 900
        const canvas_height = canvas.height = 900

        // Sprite sheet
        const playerImage = new Image()
        playerImage.src = 'img/sprite_sheet.png'
        const spriteWidth = 575
        const spriteHeight = 523

        // Sprite options
        let playerWidth = 100
        let gameFrame = 0
        const staggerFrames = 6
        const spriteAnimations = []
        const keys = []
        let speed = 10

        this.animationStates.forEach((state, i) => {
            let frames = {
                location: []
            }
            for (let j = 0; j < state.frames; j++) {
                let positionX = j * spriteWidth
                let positionY = i * spriteHeight
                frames.location.push({ x: positionX, y: positionY })
            }
            spriteAnimations[state.name] = frames
        })

        animate()

        /* Functions */
        function animate() {
            ctx.clearRect(0, 0, canvas_width, canvas_height)
            let position = Math.floor(gameFrame / staggerFrames) % spriteAnimations[playerState].location.length
            let frameX = spriteWidth * position
            let frameY = spriteAnimations[playerState].location[position].y
            let playerHeight = Math.round(playerWidth * 0.9096)
            ctx.drawImage(playerImage, frameX, frameY, spriteWidth, spriteHeight, coordX, coordY, playerWidth, playerHeight)

            gameFrame++
            moveSprite()
            requestAnimationFrame(animate)
        }

        function moveSprite() {
            if (keys['w']) {
                coordY = (coordY - speed) >= 0 ? coordY - speed : coordY
            }
            if (keys['s']) {
                coordY = (coordY + speed) > (canvas_height - playerWidth) ? coordY : coordY + speed
            }
            if (keys['a']) {
                coordX = (coordX - speed) >= 0 ? coordX - speed : coordX
            }
            if (keys['d']) {
                coordX = (coordX + speed) > (canvas_width - playerWidth) ? coordX : coordX + speed
            }
        }

        /* Event Listeners */
        const dropdown = document.getElementById('animations')
        dropdown.addEventListener('change', function (e) {
            playerState = e.target.value
        })

        window.addEventListener('keydown', e => {
            key = e.key.toLowerCase
            keys[key] = true
        })
        window.addEventListener('keyup', e => {
            key = e.key.toLowerCase
            delete keys[key]
        })
    },
    methods: {

    }
});