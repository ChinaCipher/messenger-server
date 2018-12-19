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
        ctx.status = 401
        return
    }

    if (!secret || (secret.length < 8) || (secret.length > 30)) {
        ctx.body = {
            message: "password must be longer than 3 and shorter than 30."
        }
        ctx.status = 401
        return
    }

    let password = await bcrypt.hash(secret, '$2b$10$' + sha256.hash(username).slice(0, 22))

    let nickname = username

    let avatar = "https://herher.ntut.com.tw/img/dolphin.png"

    let pair = ec.generateKeyPair()

    let publicKey = pair.publicKey

    let key = sha256.hash(secret).slice(0, 32)
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
        ctx.status = 401
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

router.patch('/:username', async ctx => {
    let username = ctx.params.username
    let nickname = ctx.request.body.nickname
    let avatar = ctx.request.body.avatar

    let user = await User.find(username)

    if (!user) {
        ctx.body = {
            message: "username does not exist."
        }
        ctx.status = 404
        return
    }

    if (!ctx.session.login) {
        ctx.body = {
            message: "not logged in."
        }
        ctx.status = 401
        return
    }

    if (username != ctx.session.username) {
        ctx.body = {
            message: "permission denied."
        }
        ctx.status = 403
        return
    }

    if (nickname) {
        user.nickname = nickname
    }

    if (avatar) {
        user.avatar = avatar
    }

    ctx.body = {
        avatar: user.avatar,
        username: user.username,
        nickname: user.nickname
    }
})

router.patch('/:username/password', async ctx => {
    let username = ctx.params.username
    let oldSecret = ctx.request.body.oldSecret
    let newSecret = ctx.request.body.newSecret

    let user = await User.find(username)

    if (!user) {
        ctx.body = {
            message: "username does not exist."
        }
        ctx.status = 404
        return
    }

    if (!ctx.session.login) {
        ctx.body = {
            message: "not logged in."
        }
        ctx.status = 401
        return
    }

    if (username != ctx.session.username) {
        ctx.body = {
            message: "permission denied."
        }
        ctx.status = 403
        return
    }

    let oldPassword = await bcrypt.hash(oldSecret, '$2b$10$' + sha256.hash(username).slice(0, 22))
    if (oldPassword != user.password) {
        ctx.body = {
            message: "old password is wrong."
        }
        ctx.status = 401
        return
    }

    if (!newSecret || (newSecret.length < 8) || (newSecret.length > 30)) {
        ctx.body = {
            message: "password must be longer than 3 and shorter than 30."
        }
        ctx.status = 401
        return
    }

    user.password = await bcrypt.hash(newSecret, '$2b$10$' + sha256.hash(username).slice(0, 22))

    let key = sha256.hash(oldSecret).slice(0, 32)
    let iv = sha256.hash(username).slice(0, 16)
    let originalPrivateKey = aes.decrypt(user.privateKey, key, iv)

    key = sha256.hash(newSecret).slice(0, 32)
    user.privateKey = aes.encrypt(originalPrivateKey, key, iv)

    ctx.status = 204
})

module.exports = router