const Router = require('koa-router')

const test = require('./api/test')

const router = new Router()

router.use('/', test.router.routes(), test.router.allowedMethods())

module.exports = {
    router
}