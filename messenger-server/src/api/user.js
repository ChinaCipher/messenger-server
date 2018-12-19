const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const Router = require('koa-router')

const User = require('../db/user')

const router = new Router()


router.post('/', async ctx => {
    let username = ctx.request.body.username
    let secret = ctx.request.body.secret

    let user = await User.find(username)
    if (user) {
        ctx.body = {
            message: "username was already taken."
        }
        ctx.status = 403
        return
    }

    let salt = '$2b$10$' + crypto.createHash('sha256').update(username).digest('hex').slice(0, 22)
    let password = await bcrypt.hash(secret, salt)

    let publicKey = 'wow'
    let privateKey = 'yee'

    try {
        await User.create({
            username,
            password,
            nickname: username,
            avatar: "https://herher.ntut.com.tw/img/dolphin.png",
            publicKey,
            privateKey,
        })
    }
    catch (e) {
        ctx.body = {
            message: "database validation error occurred."
        }
        ctx.status = 403
        return
    }

    user = await User.find(username)

    ctx.body = {
        avatar: user.avatar,
        username: user.username,
        nickname: user.nickname
    }
    ctx.status = 201
})

router.get('/:username', async ctx => {
    let username = ctx.params.username
    let user = await User.find(username)

    if (!user) {
        ctx.body = {
            message: "username does not exist."
        }
        ctx.status = 404
        return
    }

    ctx.body = {
        user: {
            avatar: user.avatar,
            username: user.username,
            nickname: user.nickname
        },
        publicKey: user.publicKey
    }
})

module.exports = router