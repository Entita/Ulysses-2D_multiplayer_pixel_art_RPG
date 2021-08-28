const mongoose = require('mongoose')
const Schema = mongoose.Schema

const opts = {
    timestamps: { currentTime: () => Math.floor(Date.now() / 1000) }
}

const userSchema = new Schema({
    nickname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, opts)

const User = mongoose.model('user', userSchema)
module.exports = User