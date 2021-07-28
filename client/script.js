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
        this.context = document.getElementById('game').getContext('2d')
        this.socket.on('position', data => {
            var board = document.getElementById('game')
            this.context.clearRect(0, 0, board.width, board.height)
            this.context.fillRect(data.x, data.y, 20, 20)
        })
    },
    methods: {
        move(direction) {
            this.socket.emit('move', direction)
        }
    }
});