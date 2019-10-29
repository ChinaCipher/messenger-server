const mongoose = require('mongoose')
const Schema = mongoose.Schema

// 定義 user 結構
const user = new Schema({
    username: { type: String, index: { unique: true, dropDups: true }, minlength: 3, maxlength: 64 },
    password: { type: String, match: /\w+/, minlength: 8, maxlength: 8964 },
    avatar: { type: String, default: '' },
    nickname: { type: String, default: '' },
    privateKey: { type: String },
    publicKey: { type: String },
})

// 定義 user 的 static 方法
user.statics.findOneByUsername = function (username) {
    return this.findOne({ username })
}

// 建立 user 模型
const model = mongoose.model('user', user)

module.exports = model
