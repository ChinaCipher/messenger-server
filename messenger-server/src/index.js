require('@babel/polyfill')
const Koa = require('koa')
const Router = require('koa-router')
const logger = require('koa-logger')
const statics = require('koa-static')
const session = require('koa-session')
const bodyparser = require('koa-bodyparser')

const dbserver = require('./db/dbserver')
const api = require('./route')
const config = require('./config')

const app = new Koa()
const router = new Router()

app.keys = config.app.keys

app.use(logger())
app.use(bodyparser())
app.use(statics(__dirname + '/../public'))
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

dbserver.connect()

router.use('/api', api.router.routes(), api.router.allowedMethods())
app.use(router.routes()).use(router.allowedMethods())

app.listen(config.app.port, () => {
    console.log(`Server is running at port ${config.app.port}.`)
})