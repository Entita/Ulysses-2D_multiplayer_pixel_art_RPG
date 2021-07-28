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
        this.context.fillRect(this.position.x, this.position.y, 20, 20)
    }
});