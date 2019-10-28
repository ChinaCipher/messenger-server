const Router = require('koa-router')

const test = require('./routes/test')
const chat = require('./routes/chat')
const user = require('./routes/user')
const session = require('./routes/session')

const router = new Router()

router.use('/', test.routes(), test.allowedMethods())
router.use('/chat', chat.routes(), chat.allowedMethods())
router.use('/user', user.routes(), user.allowedMethods())
router.use('/session', session.routes(), session.allowedMethods())

module.exports = {
    router
}
