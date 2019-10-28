require('@babel/polyfill')
const Koa = require('koa')
const Router = require('koa-router')
const body = require('koa-body')
const logger = require('koa-logger')
const statics = require('koa-static')
const session = require('koa-session')

const config = require('./config')
const database = require('./database')
const api = require('./route')
const socket = require('./socket')


const app = new Koa()
const router = new Router()

// 連接資料庫
database.connect()

app.keys = config.app.keys

// 供網頁前端開發時解除 cors 限制
let args = process.argv.slice(2)
if (args[0] == '--allow-cors') {
    const cors = require('koa-cors')
    app.use(cors({
        origin: 'http://localhost:8080',
        credentials: true
    }))

    console.log("Set header - Access-Control-Allow-Origin: http://localhost:8080")
    console.log("Set header - Access-Control-Allow-Credentials: true")
}

app.use(logger())
app.use(statics(__dirname + '/../public'))
app.use(body())
app.use(session({
    key: config.session.key,
    maxAge: config.session.maxAge,
    autoCommit: true,
    overwrite: true,
    httpOnly: true,
    signed: true,
    rolling: false,
    renew: false,
}, app))
app.use(socket.middleware())

router.use('/api', api.router.routes(), api.router.allowedMethods())
app.use(router.routes()).use(router.allowedMethods())

const server = socket.setupServer(app)

server.listen(config.app.port, () => {
    console.log(`Server is running on http://localhost:${config.app.port}.`)
})
