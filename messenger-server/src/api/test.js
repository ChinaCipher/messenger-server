const Router = require('koa-router')

const config = require('../config')

const router = new Router()


// GET /api/
router.get('/', async ctx => {
    // 回傳版本資訊
    ctx.body = {
        version: "v0.5.0",
        message: "Hello, China!"
    }
})

module.exports = router