const mongoose = require('mongoose')
const config = require('./config')

// 連接資料庫
function connect() {
    const userString = `${config.database.username}:${config.database.password}`
    const connectionString = `mongodb://${userString}@${config.database.host}/${config.database.name}`

    mongoose.connect(connectionString, { useNewUrlParser: true, autoIndex: false })

    // 資料庫連接成功後提示
    mongoose.connection.on('connected', () => {
        console.log('Mongoose default connection open to ' + connectionString)
    })

    // 資料庫連接失敗後提示
    mongoose.connection.on('error', (err) => {
        console.log('Mongoose default connection error: ' + err)
    })

    // 資料庫斷開連接後提示
    mongoose.connection.on('disconnected', () => {
        console.log('Mongoose default connection disconnected')
    })

    // 在程序結束前先關閉資料庫連接
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
