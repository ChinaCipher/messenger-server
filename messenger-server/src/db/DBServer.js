const mongoose = require('mongoose')

function start() {
    const connString = 'mongodb://localhost:27017/herher'
    mongoose.connect(connString, { /*config: { autoIndex: false }*/ })

    // MongoDB连接成功后回调，这里仅输出一行日志
    mongoose.connection.on('connected', () => {
        console.log('Mongoose default connection open to ' + connString)
    })

    // MongoDB连接出错后回调，这里仅输出一行日志
    mongoose.connection.on('error', (err) => {
        console.log('Mongoose default connection error: ' + err)
    })

    // MongoDB连接断开后回调，这里仅输出一行日志
    mongoose.connection.on('disconnected', () => {
        console.log('Mongoose default connection disconnected')
    })

    // 当前进程退出之前关闭MongoDB连接
    process.on('SIGINT', () => {
        mongoose.connection.close(() => {
            console.log('Mongoose default connection closed through app termination')
            process.exit(0)
        })
    })
}
module.exports = {
    start
}