const mongoose = require('mongoose')
const Schema = mongoose.Schema

// 定義 user 儲存結構
let user = new Schema({
    username: { type: String, index: true, minlength: 3, maxlength: 30, default: '' },
    messageKey: { type: String, index: true, default: '' },
})

// 定義 message 儲存結構
let message = new Schema({
    id: { type: Number, index: true, default: 1 },
    sender: { type: String, index: true, default: '' },
    type: { type: String, index: true, default: '' },
    content: { type: String, index: true, default: '' },
    options: { type: Object, index: true, default: {} },
    timestamp: { type: String, default: '' },
})

// 定義 chat 儲存結構
let chat = new Schema({
    messages: [message],
    visibility: { type: Boolean, default: false },
    userA: { type: user, index: { unique: true, dropDups: true } },
    userB: { type: user, index: { unique: true, dropDups: true } }
})

// 對 chat 加入靜態方法，讓他被建立成模組後可以直接調用
chat.statics.findByUsersname = function (users, fields) {
    return this.findOne({
        'userA.username': users.userA.username,
        'userB.username': users.userB.username
    }, fields)
}

// 建立 chat 模組
const model = mongoose.model('chat', chat)

module.exports = model
