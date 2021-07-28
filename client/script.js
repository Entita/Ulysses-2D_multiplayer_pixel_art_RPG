var app = new Vue({
    el: '#app',
    data() {
        return {
            socket: {},
            context: {},
            position: {
                x: 0,
                y: 0
            }
        }
    },
    created() {
        this.socket = io('https://gentle-island-28675.herokuapp.com/', { transports: ['websocket'] })
    },
    mounted() {
        // this.context = document.getElementById('game').getContext('2d')
        // this.socket.on('position', data => {
        //     var board = document.getElementById('game')
        //     this.context.clearRect(0, 0, board.width, board.height)
        //     // this.context.fillRect(data.x, data.y, 20, 20)
        // })

        let playerState = 'idle'
        const dropdown = document.getElementById('animations')
        dropdown.addEventListener('change', function (e) {
            playerState = e.target.value
        })

        const canvas = document.getElementById('game')
        const ctx = canvas.getContext('2d')

        const canvas_width = canvas.width = 600
        const canvas_height = canvas.height = 600

        const playerImage = new Image()
        playerImage.src = 'img/sprite_sheet.png'
        const spriteWidth = 575
        const spriteHeight = 523

        let gameFrame = 0
        const staggerFrames = 5
        const spriteAnimations = []
        const animationStates = [
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
        animationStates.forEach((state, i) => {
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
        console.log(spriteAnimations)

        function animate() {
            ctx.clearRect(0, 0, canvas_width, canvas_height)
            let position = Math.floor(gameFrame / staggerFrames) % spriteAnimations[playerState].location.length
            let frameX = spriteWidth * position
            let frameY = spriteAnimations[playerState].location[position].y
            ctx.drawImage(playerImage, frameX, frameY, spriteWidth, spriteHeight, 0, 0, spriteWidth, spriteHeight)

            gameFrame++
            requestAnimationFrame(animate)
        }
        animate()
    },
    methods: {
        move(direction) {
            this.socket.emit('move', direction)
        }
    }
});