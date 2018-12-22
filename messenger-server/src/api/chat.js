const crypto = require('crypto')
const Router = require('koa-router')

const User = require('../db/user')
const Chatroom = require('../db/chatroom')
const ecies = require('../util/ecies')

const router = new Router()


router.get('/', async ctx => {
    if (!ctx.session.login) {
        ctx.body = {
            message: "not logged in."
        }
        ctx.status = 401
        return
    }

    const data = await Chatroom.find(ctx.session.username, null)

    let rooms = []
    for (const index in data) {
        let user = ''
        if (data[index].userA.username == ctx.session.username) {
            user = await User.find(data[index].userB.username)
        }
        else {
            user = await User.find(data[index].userA.username)
        }

        let room = {
            avatar: user.avatar,
            username: user.username,
            nickname: user.nickname
        }
        rooms.push(room)
    }

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

    let userA = await User.find(ctx.session.username)
    let userB = user
    let rooms = await Chatroom.find(userA.username, userB.username)
    if (rooms.length) {
        ctx.body = {
            message: "chatroom already exists."
        }
        ctx.status = 403
        return
    }

    let originalMessageKey = crypto.randomBytes(32).toString('hex').slice(0, 32)

    let room = {
        userA: {
            username: userA.username,
            messageKey: JSON.stringify(await ecies.encrypt(userA.publicKey, originalMessageKey))
        },
        userB: {
            username: userB.username,
            messageKey: JSON.stringify(await ecies.encrypt(userB.publicKey, originalMessageKey))
        },
        messages: []
    }

    await Chatroom.create(room)

    ctx.body = {
        messageKey: room.userA.messageKey
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

    let user = await User.find(username)
    if (!user) {
        ctx.body = {
            message: "username does not exist."
        }
        ctx.status = 404
        return
    }

    let userA = await User.find(ctx.session.username)
    let userB = user
    let rooms = await Chatroom.find(userA.username, userB.username)
    if (!rooms.length) {
        ctx.body = {
            message: "chatroom does not exist."
        }
        ctx.status = 404
        return
    }

    let room = rooms[0]

    if (room.userA.username == ctx.session.username) {
        ctx.body = {
            messageKey: room.userA.messageKey
        }
    }
    else {
        ctx.body = {
            messageKey: room.userB.messageKey
        }
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

    let user = await User.find(username)
    if (!user) {
        ctx.body = {
            message: "username does not exist."
        }
        ctx.status = 404
        return
    }

    let userA = await User.find(ctx.session.username)
    let userB = user
    let rooms = await Chatroom.find(userA.username, userB.username)
    if (!rooms.length) {
        ctx.body = {
            message: "chatroom does not exist."
        }
        ctx.status = 404
        return
    }

    let room = rooms[0]

    let messages = room.messages

    index = index || messages.length
    count = count || 1

    messages = messages.slice(Math.max(0, index - count), index)

    let result = []
    messages.forEach(message => {
        result.push({
            id: message.id,
            sender: message.sender,
            type: message.type,
            content: message.content,
            options: message.options,
            timestamp: message._timestamp
        })
    });

    ctx.body = {
        messages: result
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

    let user = await User.find(username)
    if (!user) {
        ctx.body = {
            message: "username does not exist."
        }
        ctx.status = 404
        return
    }

    let userA = await User.find(ctx.session.username)
    let userB = user
    let rooms = await Chatroom.find(userA.username, userB.username)
    if (!rooms.length) {
        ctx.body = {
            message: "chatroom does not exist."
        }
        ctx.status = 404
        return
    }

    let room = rooms[0]

    let id = room.messages.length + 1

    let message = {
        id,
        sender: ctx.session.username,
        type,
        content,
        options,
        timestamp: new Date()
    }

    await room.postMessage(message)

    ctx.body = message
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

    let user = await User.find(username)
    if (!user) {
        ctx.body = {
            message: "username does not exist."
        }
        ctx.status = 404
        return
    }

    let userA = await User.find(ctx.session.username)
    let userB = user
    let rooms = await Chatroom.find(userA.username, userB.username)
    if (!rooms.length) {
        ctx.body = {
            message: "chatroom does not exist."
        }
        ctx.status = 404
        return
    }

    let room = rooms[0]

    if (messageId > room.messages.length) {
        ctx.body = {
            message: "message does not exist."
        }
        ctx.status = 404
        return
    }

    let message = room.messages[messageId - 1]

    ctx.body = {
        id: message.id,
        sender: message.sender,
        type: message.type,
        content: message.content,
        options: message.options,
        timestamp: message._timestamp
    }
})

module.exports = router 