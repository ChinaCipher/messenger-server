const mongoose = require('mongoose')

function connect() {
    const connString = 'mongodb://localhost:27017/CCM'
    mongoose.connect(connString, { /*config: { autoIndex: false }*/ })

    // MongoDB 連接成功後回調，這裡僅輸出一行日誌
    mongoose.connection.on('connected', () => {
        console.log('Mongoose default connection open to ' + connString)
    })

    // MongoDB 連接出錯後回調，這裡僅輸出一行日誌
    mongoose.connection.on('error', (err) => {
        console.log('Mongoose default connection error: ' + err)
    })

    // MongoDB 連接斷開後回調，這裡僅輸出一行日誌
    mongoose.connection.on('disconnected', () => {
        console.log('Mongoose default connection disconnected')
    })

    // 當前進程退出之前關閉MongoDB連接
    process.on('SIGINT', () => {
        mongoose.connection.close(() => {
            console.log('Mongoose default connection closed through app termination')
            process.exit(0)
        })
    })
}
module.exports = {
    connect
}