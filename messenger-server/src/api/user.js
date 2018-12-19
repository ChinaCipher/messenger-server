const bcrypt = require('bcryptjs')
const Router = require('koa-router')

const User = require('../db/user')
const ec = require('../util/ec')
const aes = require('../util/aes')
const sha256 = require('../util/sha256')

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

    let password = await bcrypt.hash(secret, '$2b$10$' + sha256.hash(username).slice(0, 22))

    let nickname = username

    let avatar = "https://herher.ntut.com.tw/img/dolphin.png"

    let pair = ec.generateKeyPair()
    
    let publicKey = pair.publicKey
    
    let key = sha256.hash(password).slice(0, 32)
    let iv = sha256.hash(username).slice(0, 16)
    let privateKey = aes.encrypt(pair.privateKey, key, iv)

    try {
        await User.create({
            username,
            password,
            nickname,
            avatar,
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