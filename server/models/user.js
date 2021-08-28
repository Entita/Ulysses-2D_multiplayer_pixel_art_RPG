const mongoose = require('mongoose')
const moment = require('moment')
const Schema = mongoose.Schema

const date = moment(Date.now()).format('h:mm a, MMMM Do YYYY')

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
}, { timestamps: date })

const User = mongoose.model('user', userSchema)
module.exports = User