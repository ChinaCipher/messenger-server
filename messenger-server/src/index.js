require('@babel/polyfill')
const Koa = require('koa')
const Router = require('koa-router')
const body = require('koa-body')
const logger = require('koa-logger')
const statics = require('koa-static')
const session = require('koa-session')
const http = require('http')
const socketio = require('socket.io')

const config = require('./config')
const db = require('./db/server')
const api = require('./route')


const app = new Koa()
const router = new Router()

db.connect()

app.keys = config.app.keys || ['some secret hurr']

let args = process.argv.slice(2)
if (args[0] == '--allow-cors') {
    const cors = require('koa-cors')
    app.use(cors({
        origin: "http://localhost:8080",
        credentials: true
    }))

    console.log("Set header - Access-Control-Allow-Origin: http://localhost:8080")
    console.log("Set header - Access-Control-Allow-Credentials: true")
}

app.use(logger())
app.use(statics(__dirname + '/../public'))
app.use(body())
app.use(session({
    key: config.session.key || 'koa:sess',
    maxAge: config.session.maxAge || 86400000,
    autoCommit: true,
    overwrite: true,
    httpOnly: true,
    signed: true,
    rolling: false,
    renew: false,
}, app))

router.use('/api', api.router.routes(), api.router.allowedMethods())
app.use(router.routes()).use(router.allowedMethods())

const server = http.createServer(app.callback())
const io = socketio(server)

io.on('connection', socket => {
    let ctx = app.createContext(socket.request, new http.OutgoingMessage())
    socket.session = ctx.session
    console.log(socket.session)
    console.log('welcome!')

    if (!socket.session.login) {
        console.log('you should not pass')
        new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve()
            }, 3000)
        }).then(() => {
            socket.disconnect()
        })
    }

    socket.on('wow', data => {
        console.log(data)
    })

    socket.on('disconnect', () => {
        let ctx = app.createContext(socket.request, new http.OutgoingMessage())
        socket.session = ctx.session
        console.log(socket.session)
        console.log('exit...')
    })
})

server.listen(config.app.port || 8787, () => {
    console.log(`Server is running on http://localhost:${config.app.port || 8787}.`)
})