const mongoose = require('mongoose')
const Schema = mongoose.Schema

// 定義 user 結構
const user = new Schema({
    username: { type: String, index: { unique: true, dropDups: true }, minlength: 3, maxlength: 30 },
    password: { type: String, match: /\w+/, index: true },
    avatar: { type: String, index: true, default: '' },
    nickname: { type: String, index: true, default: '' },
    privateKey: { type: String, index: true },
    publicKey: { type: String, index: true },
})

// 建立 user 模型
const model = mongoose.model('user', user)

module.exports = model
