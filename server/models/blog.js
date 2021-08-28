const mongoose = require('mongoose')
const Schema = mongoose.Schema

const blogSchema = new Schema({
    title: {
        type: String,
        required: false
    },
    snippet: {
        type: String,
        required: false
    },
    body: {
        type: String,
        required: false
    }
}, { timestamps: true })

const Blog = mongoose.model('blog', blogSchema)
module.exports = Blog