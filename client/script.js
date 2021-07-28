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
        let x = 0

        function animate () {
            ctx.clearRect(0, 0, canvas_width, canvas_height)
            ctx.fillRect(x,50,100,100)
            x++;
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