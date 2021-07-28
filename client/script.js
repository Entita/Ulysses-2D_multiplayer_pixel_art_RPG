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

        const canvas = document.getElementById('game')
        const ctx = canvas.getContext('2d')

        const canvas_width = canvas.width = 600
        const canvas_height = canvas.height = 600

        const playerImage = new Image()
        playerImage.src = 'img/sprite_sheet.png'
        const spriteWidth = 575
        const spriteHeight = 523
        let frameX = 0
        let frameY = 0
        let gameFrame = 0
        const staggerFrames = 5
        const spriteAnimations = []
        const animationStates = [
            { name: 'idle', frames: 7 },
            { name: 'jump', frames: 7 }
        ]
        animationStates.forEach((state, i) => {
            let frames = {
                location: []
            }
            for (let j = 0; j<state.frames; j++) {
                let positionX = j * spriteWidth
                let positionY = i * spriteHeight
                frames.location.push({x: positionX, y: positionY})
            }
            spriteAnimations[state.name] = frames
        })
        console.log(spriteAnimations)

        function animate() {
            ctx.clearRect(0, 0, canvas_width, canvas_height)
            let position = Math.floor(gameFrame / staggerFrames) % 6
            frameX = spriteWidth * position
            ctx.drawImage(playerImage, frameX, frameY * spriteHeight, spriteWidth, spriteHeight, 0, 0, spriteWidth, spriteHeight)

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