const Router = require('koa-router')

const router = new Router()


router.get('/', async ctx => {
    ctx.body = {
        version: "v1.0.0",
        message: "Hello China!"
    }
})

module.exports = {
    router
}