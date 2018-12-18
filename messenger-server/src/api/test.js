const Router = require('koa-router')
const db = require('../db/User')

const router = new Router()


router.get('/', async ctx => {
    let doc = await db.findUser('zxjte9411')
    console.log(doc)
    let zxjte9411 = new db(doc)
    // zxjte9411.username = 'zxjte9411'
    ctx.body = JSON.stringify(zxjte9411, undefined, 2)
    // ctx.body = {message: "Hello China!"}
})

module.exports = {
    router
}