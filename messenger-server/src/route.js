const Router = require('koa-router')

const test = require('./api/test')
const session = require('./api/session')

const router = new Router()

router.use('/', test.router.routes(), test.router.allowedMethods())
router.use('/session', session.router.routes(), session.router.allowedMethods())

module.exports = {
    router
}