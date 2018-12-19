const bcrypt = require('bcryptjs')
const Router = require('koa-router')

const User = require('../db/user')

const router = new Router()


router.get('/', async ctx => {
    ctx.session.code = await bcrypt.genSalt(10)
    ctx.body = { code: ctx.session.code }
})

router.post('/', async ctx => {
    let username = ctx.request.body.username
    let password = ctx.request.body.password

    if (!ctx.session.code) {
        ctx.body = {
            message: "session code does not exist."
        }
        ctx.status = 401
        return
    }

    let hashsalt = ctx.session.code
    
    let user = await User.find(username)
    if (!user) {
        ctx.body = {
            message: "username does not exist."
        }
        ctx.status = 401
        return
    }

    password = `${hashsalt}${password.slice(29, 60)}`
    if (!await bcrypt.compare(user.password, password)) {
        ctx.body = {
            message: "wrong password."
        }
        ctx.status = 401
        return
    }

    ctx.session.code = undefined

    ctx.session.username = username
    ctx.session.login = true
    ctx.body = {
        user: {
            avatar: user.avatar,
            username: user.username,
            nickname: user.nickname
        },
        privateKey: user.privateKey
    }
    ctx.status = 201
})

router.delete('/', async ctx => {
    ctx.session.code = undefined

    if (!ctx.session.login) {
        ctx.body = {
            message: "not logged in."
        }
        ctx.status = 404
        return
    }

    ctx.session.username = undefined
    ctx.session.login = false
    ctx.status = 204
})

module.exports = router 