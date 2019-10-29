const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const Router = require('koa-router')

const User = require('../models/user')

const router = new Router()


// GET /api/session
router.get('/', async ctx => {
    // 用 bcrypt 產生 salt 作為驗證碼
    ctx.session.code = await bcrypt.genSalt(10)

    const username = ctx.session.username

    if (ctx.session.login) {
        let user = await User.findOneByUsername(username)

        // 如果已登入且找得到該使用者，就順便回傳該使用者資訊
        if (user) {
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
            return
        }
    }

    // 確保登入旗標為 false
    ctx.session.login = false

    ctx.body = {
        code: ctx.session.code,
        profile: null
    }
})

// POST /api/session
router.post('/', async ctx => {
    // 取得帳號和密碼
    const username = ctx.request.body.username
    const password = ctx.request.body.password

    // 沒有取得過驗證碼，登入失敗
    if (!ctx.session.code) {
        ctx.body = {
            message: "session code does not exist."
        }
        ctx.status = 401
        return
    }

    // 清除驗證碼，確保每次登入都不同
    let salt = ctx.session.code
    ctx.session.code = undefined

    let user = await User.findOneByUsername(username)

    // 沒有這個使用者，登入失敗
    if (!user) {
        ctx.body = {
            message: "username does not exist."
        }
        ctx.status = 401
        return
    }

    let result = `${salt}${password.slice(29, 60)}`

    // 密碼使用 bcrypt 雜湊後的結果不符合，登入失敗
    if (!await bcrypt.compare(user.password, result)) {
        ctx.body = {
            message: "wrong password."
        }
        ctx.status = 401
        return
    }

    // 登入成功
    ctx.session.username = username
    ctx.session.login = true
    ctx.session.id = crypto.randomBytes(4).toString('hex')

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

// DELETE /api/session
router.delete('/', async ctx => {
    // 清除驗證碼，確保每次登入都不同
    ctx.session.code = undefined

    // 尚未登入，登出失敗
    if (!ctx.session.login) {
        ctx.body = {
            message: "not logged in."
        }
        ctx.status = 404
        return
    }

    const username = ctx.session.username

    if (ctx.sockets[username]) {
        // 如果有相同 session 的 socket.io 存在就斷開
        if (ctx.sockets[username][ctx.session.id]) {
            ctx.sockets[username][ctx.session.id].disconnect()
        }
    }

    // 登出成功
    ctx.session.username = undefined
    ctx.session.login = false
    ctx.session.id = undefined

    ctx.status = 204
})

module.exports = router
