const mongoose = require('mongoose')
const moment = require('moment')
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
        default: new Array(),
        required: true
    }
}, { timestamps: { currentTime: moment(Date.now()).format('MMMM Do YYYY') } })

const User = mongoose.model('user', userSchema)
module.exports = User