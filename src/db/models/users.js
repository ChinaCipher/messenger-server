const mongoose = require('mongoose')
const Schema = mongoose.Schema

//type:字段類型，包括String, Number, Date, Buffer, Boolean, Mixed, ObjectId, Array
//index:是否索引，注意唯一索引 unique 的寫法
//default: 默認值
// 定義 users 儲存結構
const users = new Schema({
    "username": { type: String, index: { unique: true, dropDups: true }, minlength: 3, maxlength: 30 },
    "password": { type: String, match: /\w+/, index: true },
    "avatar": { type: String, index: true, default: '' },
    "nickname": { type: String, index: true, default: '' },
    "privateKey": { type: String, index: true },
    "publicKey": { type: String, index: true },
})

//靜態方法，按用戶名查找，因為 username 加了唯一索引，
//所以這裡用的是 findOne，只查詢一條數據
// 對 users 加入靜態方法，讓他被建立成模組後可以直接調用
users.statics.findByUsername = function (username) {
    return this.findOne({ username: username })
}

//建立 users 模型
const model = mongoose.model('users', users)

module.exports = model
