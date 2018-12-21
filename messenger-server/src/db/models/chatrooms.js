const mongoose = require('mongoose')

const Schema = mongoose.Schema

let user = new Schema({
    "username": { type: String, index: true, minlength: 8, maxlength: 30 },
    "messageKey": { type: String, index: true }
})

let message = new Schema({
    "id": { type: Number, index: true, default: 1 },
    "sender": { type: String, index: true },
    "type": { type: String, index: true },
    "content": { type: String, index: true },
    "options": { type: Object, index: true, default: {} }
})

let chatroom = new Schema({
    "messages": [message],
    "userA": { type: user, index: { unique: true, dropDups: true } },
    "userB": { type: user, index: { unique: true, dropDups: true } }
})

chatroom.statics.findByUsersname = function (users, fields) {
    return this.findOne({
        "userA.username": users.userA.username,
        "userB.username": users.userB.username
    }, fields)
}

const model = mongoose.model('chatroom', chatroom)

module.exports = model