const mongoose = require('mongoose')

let Schema = mongoose.Schema

let user = new Schema({
    "username": { type: String, index: true, minlength: 8, maxlength: 30 },
    "messagekey": { type: String, index: true }
})

let message = new Schema({
    "id": { type: Number, index: { unique: true, dropDups: true }, default: 0 },
    "sender": { type: String, index: true },
    "type": { type: String, index: true },
    "content": { type: String, index: true }
})

let chatroom = new Schema({
    "messages": [message],
    "userA": { type: user, index: { unique: true, dropDups: true } },
    "userB": { type: user, index: { unique: true, dropDups: true } }
})

chatroom.statics.findByUsersname = function (users) {
    return this.findOne({
        "userA.username": users.userA.username,
        "userB.username": users.userB.username
    })
}

const model = mongoose.model('chatroom', chatroom)

module.exports = model