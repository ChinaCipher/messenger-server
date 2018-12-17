const mongoose = require('mongoose')
const Schema = mongoose.Schema

//type:字段類型，包括String,Number,Date,Buffer,Boolean,Mixed,ObjectId,Array
//index:是否索引，注意唯一索引unique的寫法
//default:默認值
const User = new Schema({
    "username": { type: String, index: { unique: true, dropDups: true }, minlength: 8, maxlength: 30},
    "password": { type: String, match: /\w+/, index: true },
    "avatar": {type: String, index: true, default: ''},
    "nickname": {type: String, index: true, default: ''},
    "privatekey": { type: String, index: true },
    "publickey": { type: String, index: true },
})

//靜態方法，按用戶名查找，因為 username 加了唯一索引，
//所以這裡用的是 findOne，只查詢一條數據
User.statics.findByUsername = function (username) {
    return this.findOne({ username: username })
}

//创建模型
const model = mongoose.model('User', User)

module.exports = model