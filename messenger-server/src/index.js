require('@babel/polyfill')
const Koa = require('koa')
const Router = require('koa-router')
const logger = require('koa-logger')
const statics = require('koa-static')
const session = require('koa-session')
const bodyparser = require('koa-bodyparser')

const dbserver = require('./db/dbserver')
const api = require('./route')

const app = new Koa()
const router = new Router()

app.keys = ['wasaywasay']

app.use(logger())
app.use(bodyparser())
app.use(statics(__dirname + '/../public'))
app.use(session({
    key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
    /** (number || 'session') maxAge in ms (default is 1 days) */
    /** 'session' will result in a cookie that expires when session/browser is closed */
    /** Warning: If a session cookie is stolen, this cookie will never expire */
    maxAge: 86400000,
    autoCommit: true, /** (boolean) automatically commit headers (default true) */
    overwrite: true, /** (boolean) can overwrite or not (default true) */
    httpOnly: true, /** (boolean) httpOnly or not (default true) */
    signed: true, /** (boolean) signed or not (default true) */
    rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
    renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
}, app))

dbserver.connect()

router.use('/api', api.router.routes(), api.router.allowedMethods())
app.use(router.routes()).use(router.allowedMethods())

app.listen(3000, () => {
    console.log("Server is running at port 3000.")
})