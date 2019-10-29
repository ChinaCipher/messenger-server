require('@babel/polyfill')
const Koa = require('koa')
const Router = require('koa-router')
const body = require('koa-body')
const logger = require('koa-logger')
const statics = require('koa-static')
const session = require('koa-session')

const socket = require('./middlewares/socket')

const testRouter = require('./routes/test')
const chatRouter = require('./routes/chat')
const userRouter = require('./routes/user')
const sessionRouter = require('./routes/session')

const config = require('./config')
const database = require('./database')


// 連接資料庫
database.connect()

const app = new Koa()
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

// 註冊路由
const router = new Router()
router.use('/api/', testRouter.routes(), testRouter.allowedMethods())
router.use('/api/chat', chatRouter.routes(), chatRouter.allowedMethods())
router.use('/api/user', userRouter.routes(), userRouter.allowedMethods())
router.use('/api/session', sessionRouter.routes(), sessionRouter.allowedMethods())
app.use(router.routes()).use(router.allowedMethods())

const server = socket.setupServer(app)

server.listen(config.app.port, () => {
    console.log(`Server is running on http://localhost:${config.app.port}.`)
})
