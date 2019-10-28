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

// 定義 chat 的 static 方法
chat.statics.findByUsernames = function (usernameA, usernameB) {
    if (usernameB != null) {
        // 找出指定兩使用者的聊天室
        return this.find({
            '$or': [
                { 'userA.username': usernameA, 'userB.username': usernameB },
                { 'userA.username': usernameB, 'userB.username': usernameA },
            ]
        })
    }
    else {
        // 找出指定使用者的所有聊天室
        return this.find({
            '$or': [{ 'userA.username': usernameA }, { 'userB.username': usernameA }]
        })
    }
}

// 建立 chat 模組
const model = mongoose.model('chat', chat)

module.exports = model
