const mongoose = require('mongoose')

let Schema = mongoose.Schema

let message = new Schema({
    "id": { type: Number, index: { unique: true, dropDups: true }, default: 0 },
    "sender": { type: String, index: true },
    "type": { type: String, index: true },
    "content": { type: String, index: true }
})

let messages = new Schema({
    "messages": [message]
})

const model = mongoose.model('messages', messages)

module.exports = model