require('@babel/polyfill')
const Koa = require('koa')
const Router = require('koa-router')
const logger = require('koa-logger')
const statics = require('koa-static')
const bodyparser = require('koa-bodyparser')

const api = require('./route')

const app = new Koa()
const router = new Router()

app.use(logger())
app.use(bodyparser())
app.use(statics(__dirname + '/../public'))

router.use('/api', api.router.routes(), api.router.allowedMethods())
app.use(router.routes()).use(router.allowedMethods())

app.listen(3000, () => {
    console.log("Server is running at port 3000.")
})