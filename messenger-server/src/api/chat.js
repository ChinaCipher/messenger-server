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
    if (temprooms[username]) {
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
            messageKey: JSON.stringify(await ecies.encrypt(userA.publicKey, originalMessageKey))
        },
        userB: {
            username: [userB.username],
            messageKey: JSON.stringify(await ecies.encrypt(userB.publicKey, originalMessageKey))
        },
        messages: []
    }
    temprooms[username] = temproom

    // temp
    ctx.body = {
        messageKey: temproom.userA.messageKey
    }
})

router.get('/:username', async ctx => {
    const username = ctx.params.username

    if (!ctx.session.login) {
        ctx.body = {
            message: "not logged in."
        }
        ctx.status = 401
        return
    }

    // temp
    if (!temprooms[username]) {
        ctx.body = {
            message: "chatroom does not exist."
        }
        ctx.status = 404
        return
    }

    ctx.body = {
        messageKey: temprooms[username].userA.messageKey
    }
})

router.get('/:username/message', async ctx => {
    const username = ctx.params.username
    let index = ctx.query.index
    let count = ctx.query.count

    if (!ctx.session.login) {
        ctx.body = {
            message: "not logged in."
        }
        ctx.status = 401
        return
    }

    // temp
    if (!temprooms[username]) {
        ctx.body = {
            message: "chatroom does not exist."
        }
        ctx.status = 404
        return
    }

    // temp
    let messages = temprooms[username].messages

    // temp
    index = index || messages.length - 1
    count = count || 1

    // temp
    messages = messages.slice(Math.max(0, index - count), index)

    ctx.body = {
        messages
    }
})

router.post('/:username/message', async ctx => {
    const username = ctx.params.username
    const type = ctx.request.body.type
    const content = ctx.request.body.content
    const options = ctx.request.body.options

    if (!ctx.session.login) {
        ctx.body = {
            message: "not logged in."
        }
        ctx.status = 401
        return
    }

    // temp
    if (!temprooms[username]) {
        ctx.body = {
            message: "chatroom does not exist."
        }
        ctx.status = 404
        return
    }

    // temp
    let message = {
        id: temprooms[username].messages.length + 1,
        sender: ctx.session.username,
        type,
        content,
        options,
        timestamp: new Date()
    }

    // temp
    temprooms[username].messages.push(message)

    ctx.body = {
        message
    }
})

router.get('/:username/message/:messageId', async ctx => {
    const username = ctx.params.username
    const messageId = ctx.params.messageId

    if (!ctx.session.login) {
        ctx.body = {
            message: "not logged in."
        }
        ctx.status = 401
        return
    }

    // temp
    if (!temprooms[username]) {
        ctx.body = {
            message: "chatroom does not exist."
        }
        ctx.status = 404
        return
    }

    // temp
    if (messageId > temprooms[username].messages.length) {
        ctx.body = {
            message: "message does not exist."
        }
        ctx.status = 404
        return
    }

    // temp
    let message = temprooms[username].messages[messageId - 1]

    ctx.body = message
})

module.exports = router 