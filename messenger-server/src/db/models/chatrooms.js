const mongoose = require('mongoose')

const Schema = mongoose.Schema

let user = new Schema({
    "username": { type: String, index: true, minlength: 3, maxlength: 30, default: '' },
    "messageKey": { type: String, index: true, default: '' }
})

let message = new Schema({
    "id": { type: Number, index: true, default: 1 },
    "timestamp": { type: String, default: '' },
    "sender": { type: String, index: true, default: '' },
    "type": { type: String, index: true, default: '' },
    "content": { type: String, index: true, default: '' },
    "options": { type: Object, index: true, default: {} }
})

let chatroom = new Schema({
    "messages": [message],
    "visibility": { type: Boolean, default: false },
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