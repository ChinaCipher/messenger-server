const Router = require('koa-router')
const db = require('../db/User')

const router = new Router()


router.get('/', async ctx => {
    let zxjte9411 = new db.User(await db.init('zxjte9411'))
    ctx.body = JSON.stringify(zxjte9411, undefined, 2)
    // ctx.body = {message: "Hello China!"}
})

module.exports = {
    router
}