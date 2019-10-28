const mongoose = require('mongoose')
const config = require('./config')

// 與 db 連接相關設定
function connect() {
    const userString = `${config.database.username}:${config.database.password}`
    const connectionString = `mongodb://${userString}@${config.database.host}/${config.database.name}?authSource=admin`

    mongoose.connect(connectionString, { useNewUrlParser: true, autoIndex: false })

    // MongoDB 連接成功後回調，這裡僅輸出一行日誌
    mongoose.connection.on('connected', () => {
        console.log('Mongoose default connection open to ' + connectionString)
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
