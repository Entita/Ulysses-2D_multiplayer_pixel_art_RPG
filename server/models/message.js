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
}, { timestamps: true })

const Message = mongoose.model('chat', messageSchema)
module.exports = Message