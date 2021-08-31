const mongoose = require('mongoose')
const Schema = mongoose.Schema

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
    },
    characters: {
        type: Array,
        default: new Array()
    },
    verified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

const User = mongoose.model('user', userSchema)
module.exports = User