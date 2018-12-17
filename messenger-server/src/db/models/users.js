// const crypto = require('crypto')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

//type:字段类型，包括String,Number,Date,Buffer,Boolean,Mixed,ObjectId,Array
//index:是否索引，注意唯一索引unique的写法
//default:默认值
const User = new Schema({
    "username": { type: String, index: { unique: true, dropDups: true }, minlength: 8, maxlength: 30},
    "password": { type: String, match: /\w+/, index: true },
    "avatar": {type: String, index: true, default: ''},
    "nickname": {type: String, index: true, default: ''},
    "privatekey": { type: String, index: true },
    "publickey": { type: String, index: true },
})

//使用setter，将用户输入的明文密码sha1之后存储
// User.path('password').set(function (v) {
//     let shasum = crypto.createHash('sha1')
//     shasum.update(v)
//     return shasum.digest('hex')
// })

//使用 middleware，每次保存都记录一下最后更新时间
User.pre('save', function(next) {
    this.updated = Date.now()
    next()
})

//静态方法，按用户名查找，因为username加了唯一索引，
//所以这里用的是findOne，只查询一条数据
User.statics.findByUsername = function (username) {
    return this.findOne({ username: username })
}

User.statics.get_full_name = function (username) {
    let user = this.findOne({ username: username })
    return user.username + user.nickname
}

//创建模型
const model = mongoose.model('User', User)

module.exports = model