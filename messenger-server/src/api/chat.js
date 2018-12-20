const crypto = require('crypto')
const Router = require('koa-router')

const User = require('../db/user')
const ecies = require('../util/ecies')

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

router.post('/', async ctx => {
    const username = ctx.request.body.username

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

    // temp
    if (rooms.username) {
        ctx.body = {
            message: "chatroom already exists."
        }
        ctx.status = 403
        return
    }

    let originalMessageKey = crypto.randomBytes(32)

    let userA = await User.find(ctx.session.username)
    let userB = user

    // temp
    let temproom = {
        userA: {
            username: [userA.username],
            messageKey: await ecies.encrypt(userA.publicKey, originalMessageKey)
        },
        userB: {
            username: [userB.username],
            messageKey: await ecies.encrypt(userB.publicKey, originalMessageKey)
        },
        messages: []
    }
    temprooms[username] = temproom

    // temp
    ctx.body = {
        messageKey: temproom.userA.messageKey
    }
})

module.exports = router 