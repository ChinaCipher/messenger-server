const Router = require('koa-router')

const test = require('./api/test')
const session = require('./api/session')

const router = new Router()

router.use('/', test.routes(), test.allowedMethods())
router.use('/session', session.routes(), session.allowedMethods())

module.exports = {
    router
}