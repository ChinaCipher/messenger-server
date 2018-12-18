const Router = require('koa-router')
const bcrypt = require('bcryptjs')

const router = new Router()


router.get('/', async ctx => {
    if (!ctx.session.code) {
        ctx.session.code = await bcrypt.genSalt(10)
    }

    ctx.body = { code: ctx.session.code }
})

module.exports = router