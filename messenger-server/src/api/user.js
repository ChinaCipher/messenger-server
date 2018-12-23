const bcrypt = require('bcryptjs')
const Router = require('koa-router')

const User = require('../db/user')
const aes = require('../util/aes')
const ecies = require('../util/ecies')
const sha256 = require('../util/sha256')

const router = new Router()


router.post('/', async ctx => {
    const username = ctx.request.body.username
    const secret = ctx.request.body.secret

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

    let pair = ecies.generateKeyPair()
    let key = sha256.hash(secret).slice(0, 32)
    let iv = sha256.hash(username).slice(0, 16)

    let profile = {
        username,
        password: await bcrypt.hash(secret, '$2b$10$' + sha256.hash(username).slice(0, 22)),
        nickname: username,
        avatar: 'img/default_avatar.png',
        publicKey: pair.publicKey,
        privateKey: aes.encrypt(pair.privateKey, key, iv)
    }

    try {
        await User.create(profile)
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
    const username = ctx.params.username

    let user = await User.find(username)
    if (!user) {
        ctx.body = {
            message: "username does not exist."
        }
        ctx.status = 404
        return
    }

    ctx.body = {
        avatar: user.avatar,
        username: user.username,
        nickname: user.nickname
    }
})

router.patch('/:username', async ctx => {
    const username = ctx.params.username
    const nickname = ctx.request.body.nickname
    const avatar = ctx.request.body.avatar

    if (!ctx.session.login) {
        ctx.body = {
            message: "not logged in."
        }
        ctx.status = 401
        return
    }

    let user = await User.find(username)
    if (!user) {
        ctx.body = {
            message: "username does not exist."
        }
        ctx.status = 404
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
    const username = ctx.params.username
    const oldSecret = ctx.request.body.oldSecret
    const newSecret = ctx.request.body.newSecret

    if (!ctx.session.login) {
        ctx.body = {
            message: "not logged in."
        }
        ctx.status = 401
        return
    }

    let user = await User.find(username)
    if (!user) {
        ctx.body = {
            message: "username does not exist."
        }
        ctx.status = 404
        return
    }

    if (username != ctx.session.username) {
        ctx.body = {
            message: "permission denied."
        }
        ctx.status = 403
        return
    }

    if (!newSecret || (newSecret.length < 8) || (newSecret.length > 30)) {
        ctx.body = {
            message: "password must be longer than 3 and shorter than 30."
        }
        ctx.status = 401
        return
    }

    let oldPassword = await bcrypt.hash(oldSecret, '$2b$10$' + sha256.hash(username).slice(0, 22))
    if (oldPassword != user.password) {
        ctx.body = {
            message: "wrong password."
        }
        ctx.status = 401
        return
    }

    user.password = await bcrypt.hash(newSecret, '$2b$10$' + sha256.hash(username).slice(0, 22))

    let oldKey = sha256.hash(oldSecret).slice(0, 32)
    let newKey = sha256.hash(newSecret).slice(0, 32)
    let iv = sha256.hash(username).slice(0, 16)

    user.privateKey = aes.encrypt(aes.decrypt(user.privateKey, oldKey, iv), newKey, iv)

    ctx.status = 204
})

module.exports = router