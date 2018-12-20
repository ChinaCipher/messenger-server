const Router = require('koa-router')

const User = require('../db/user')

const router = new Router()


// temp
let temprooms = {}

router.get('/', async ctx => {
    if (!ctx.session.login) {
        ctx.body = {
            message: "not logged in."
        }
        ctx.status = 401
        return
    }

    // temp
    let rooms = Object.values(temprooms)

    ctx.body = {
        rooms
    }
})
module.exports = router 