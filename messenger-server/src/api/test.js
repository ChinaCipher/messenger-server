const Router = require('koa-router')

const config = require('../config')

const router = new Router()


router.get('/', async ctx => {
    ctx.body = {
        version: config.app.version,
        message: "Hello, China!"
    }
})

module.exports = {
    router
}