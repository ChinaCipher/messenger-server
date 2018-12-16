require('@babel/polyfill')
const Koa = require('koa')
const Router = require('koa-router')
const logger = require('koa-logger')

const app = new Koa()
const router = new Router()

app.use(logger())

router.get('/', async ctx => {
    ctx.body = "Hello China!"
})

app.use(router.routes())

app.listen(3000)