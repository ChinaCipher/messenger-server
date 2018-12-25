const Router = require('koa-router')

const config = require('../config')

const router = new Router()


router.get('/', async ctx => {
    ctx.body = {
        version: "v0.5.0",
        message: "Hello, China!"
    }
})

module.exports = router