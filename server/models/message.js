const mongoose = require('mongoose')
const Schema = mongoose.Schema

const messageSchema = new Schema({
    player: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }
}, { timestamps: { createdAt: 'created_at' } })

const Message = mongoose.model('chat', messageSchema)
module.exports = Message