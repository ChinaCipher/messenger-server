const bcrypt = require('bcryptjs')
const Router = require('koa-router')

const User = require('../db/user')

const router = new Router()


router.get('/', async ctx => {
    ctx.session.code = await bcrypt.genSalt(10)

    if (!ctx.session.login) {
        ctx.body = {
            code: ctx.session.code,
            profile: null
        }
        return
    }

    let user = await User.find(ctx.session.username)

    ctx.body = {
        code: ctx.session.code,
        profile: {
            user: {
                avatar: user.avatar,
                username: user.username,
                nickname: user.nickname
            },
            privateKey: user.privateKey
        }
    }
})

router.post('/', async ctx => {
    const username = ctx.request.body.username
    const password = ctx.request.body.password

    if (!ctx.session.code) {
        ctx.body = {
            message: "session code does not exist."
        }
        ctx.status = 401
        return
    }

    let salt = ctx.session.code
    ctx.session.code = undefined

    let user = await User.find(username)
    if (!user) {
        ctx.body = {
            message: "username does not exist."
        }
        ctx.status = 401
        return
    }

    let result = `${salt}${password.slice(29, 60)}`
    if (!await bcrypt.compare(user.password, result)) {
        ctx.body = {
            message: "wrong password."
        }
        ctx.status = 401
        return
    }

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