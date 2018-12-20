const mongoose = require('mongoose')
const Schema = mongoose.Schema

//type:字段類型，包括String,Number,Date,Buffer,Boolean,Mixed,ObjectId,Array
//index:是否索引，注意唯一索引unique的寫法
//default:默認值
const users = new Schema({
    "username": { type: String, index: { unique: true, dropDups: true }, minlength: 3, maxlength: 30 },
    "password": { type: String, match: /\w+/, index: true},
    "avatar": { type: String, index: true, default: '' },
    "nickname": { type: String, index: true, default: '' },
    "privateKey": { type: String, index: true },
    "publicKey": { type: String, index: true },
})

//靜態方法，按用戶名查找，因為 username 加了唯一索引，
//所以這裡用的是 findOne，只查詢一條數據
users.statics.findByUsername = function (username) {
    return this.findOne({ username: username })
}

//创建模型
const model = mongoose.model('users', users)

module.exports = model