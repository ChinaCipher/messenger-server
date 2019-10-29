const crypto = require('crypto')
const Router = require('koa-router')

const User = require('../models/user')
const Chat = require('../models/chat')
const ecies = require('../util/ecies')

const router = new Router()


// GET /api/chat
router.get('/', async ctx => {
    // 如果尚未登入，查詢失敗
    if (!ctx.session.login) {
        ctx.body = {
            message: "not logged in."
        }
        ctx.status = 401
        return
    }

    const username = ctx.session.username

    const chats = await Chat.findByUsernames(username)

    let result = []
    for (const index in chats) {
        let chat = chats[index]

        // 跳過已存在但不可見的聊天室
        if (!chat.visibility) {
            if (chat.userB.username == username) {
                continue
            }
        }

        // 取得對方使用者物件
        let opposite = null
        if (chat.userA.username == username) {
            opposite = await User.findOneByUsername(chat.userB.username)
        }
        else {
            opposite = await User.findOneByUsername(chat.userA.username)
        }

        // 加入結果陣列中
        result.push({
            avatar: opposite.avatar,
            username: opposite.username,
            nickname: opposite.nickname
        })
    }

    // 查詢聊天室列表成功
    ctx.body = {
        rooms: result
    }
})

// POST /api/chat
router.post('/', async ctx => {
    // 如果尚未登入，查詢失敗
    if (!ctx.session.login) {
        ctx.body = {
            message: "not logged in."
        }
        ctx.status = 401
        return
    }

    const username = ctx.session.username
    const oppositeUsername = ctx.request.body.username

    let opposite = await User.findOneByUsername(oppositeUsername)

    // 使用者不存在，建立聊天室失敗
    if (!opposite) {
        ctx.body = {
            message: "username does not exist."
        }
        ctx.status = 404
        return
    }

    // 取得聊天雙方的使用者物件
    let userA = await User.findOneByUsername(username)
    let userB = opposite

    let chats = await Chat.findByUsernames(userA.username, userB.username)
    if (chats.length) {
        let chat = chats[0]

        // 聊天室已建立但不可見，直接回傳訊息金鑰
        if (!chat.visibility) {
            if (chat.userA.username == username) {
                ctx.body = {
                    messageKey: chat.userA.messageKey
                }
            }
            else {
                ctx.body = {
                    messageKey: chat.userB.messageKey
                }
                chat.visibility = true
                chat.save() // TODO: 不確定是否有必要
            }
            return
        }

        // 聊天室已建立且可見，建立聊天室失敗
        ctx.body = {
            message: "chatroom already exists."
        }
        ctx.status = 403
        return
    }

    // 產生訊息金鑰
    let originalMessageKey = crypto.randomBytes(32).toString('hex').slice(0, 32)

    // 以對話雙方使用者之 EC 公鑰加密
    let chat = {
        userA: {
            username: userA.username,
            messageKey: JSON.stringify(await ecies.encrypt(userA.publicKey, originalMessageKey))
        },
        userB: {
            username: userB.username,
            messageKey: JSON.stringify(await ecies.encrypt(userB.publicKey, originalMessageKey))
        },
        visibility: false,
        messages: []
    }

    // 建立聊天室成功
    await Chat.create(chat)

    ctx.body = {
        messageKey: chat.userA.messageKey
    }
})

// GET /api/chat/<username>
router.get('/:username', async ctx => {
    // 如果尚未登入，查詢失敗
    if (!ctx.session.login) {
        ctx.body = {
            message: "not logged in."
        }
        ctx.status = 401
        return
    }

    const username = ctx.session.username
    const oppositeUsername = ctx.params.username

    let opposite = await User.findOneByUsername(oppositeUsername)

    // 使用者不存在，查詢聊天室失敗
    if (!opposite) {
        ctx.body = {
            message: "username does not exist."
        }
        ctx.status = 404
        return
    }

    let userA = await User.findOneByUsername(username)
    let userB = opposite

    let chats = await Chat.findByUsernames(userA.username, userB.username)

    // 聊天室不存在，查詢聊天室失敗
    if (!chats.length) {
        ctx.body = {
            message: "chatroom does not exist."
        }
        ctx.status = 404
        return
    }

    let chat = chats[0]

    // 聊天室不可見，查詢聊天室失敗
    if (!chat.visibility) {
        if (chat.userB.username == username) {
            ctx.body = {
                message: "chatroom does not exist."
            }
            ctx.status = 404
            return
        }
    }

    // 查詢聊天室成功
    if (chat.userA.username == username) {
        ctx.body = {
            messageKey: chat.userA.messageKey
        }
    }
    else {
        ctx.body = {
            messageKey: chat.userB.messageKey
        }
    }
})

// GET /api/chat/<username>/message
router.get('/:username/message', async ctx => {
    // 如果尚未登入，查詢失敗
    if (!ctx.session.login) {
        ctx.body = {
            message: "not logged in."
        }
        ctx.status = 401
        return
    }

    const username = ctx.session.username
    const oppositeUsername = ctx.params.username

    let opposite = await User.findOneByUsername(oppositeUsername)

    // 使用者不存在，查詢聊天室訊息失敗
    if (!opposite) {
        ctx.body = {
            message: "username does not exist."
        }
        ctx.status = 404
        return
    }

    let userA = await User.findOneByUsername(username)
    let userB = opposite

    let chats = await Chat.findByUsernames(userA.username, userB.username)

    // 聊天室不存在，查詢聊天室訊息失敗
    if (!chats.length) {
        ctx.body = {
            message: "chatroom does not exist."
        }
        ctx.status = 404
        return
    }

    let chat = chats[0]

    // 聊天室不可見，查詢聊天室訊息失敗
    if (!chat.visibility) {
        if (chat.userB.username == username) {
            ctx.body = {
                message: "chatroom does not exist."
            }
            ctx.status = 404
            return
        }
    }

    let messages = chat.messages

    // 取得檢索條件
    const index = ctx.query.index || messages.length
    const count = ctx.query.count || 1

    // 取出特定範圍的訊息
    messages = messages.slice(Math.max(0, index - count), index)

    // 查詢聊天室訊息成功
    ctx.body = {
        messages
    }
})

// POST /api/chat/<username>/message
router.post('/:username/message', async ctx => {
    // 如果尚未登入，發送訊息失敗
    if (!ctx.session.login) {
        ctx.body = {
            message: "not logged in."
        }
        ctx.status = 401
        return
    }

    const username = ctx.session.username
    const oppositeUsername = ctx.params.username

    let opposite = await User.findOneByUsername(oppositeUsername)

    // 使用者不存在，發送訊息失敗
    if (!opposite) {
        ctx.body = {
            message: "username does not exist."
        }
        ctx.status = 404
        return
    }

    let userA = await User.findOneByUsername(username)
    let userB = opposite

    let chats = await Chat.findByUsernames(userA.username, userB.username)

    // 聊天室不存在，發送訊息失敗
    if (!chats.length) {
        ctx.body = {
            message: "chatroom does not exist."
        }
        ctx.status = 404
        return
    }

    let chat = chats[0]

    // 聊天室不可見，發送訊息失敗
    if (!chat.visibility) {
        if (chat.userB.username == username) {
            ctx.body = {
                message: "chatroom does not exist."
            }
            ctx.status = 404
            return
        }
        else {
            chat.visibility = true
            chat.save() // TODO: 不確定是否有必要
        }
    }

    // 發送訊息
    let message = {
        id: chat.messages.length + 1,
        sender: ctx.session.username,
        type: ctx.request.body.type,
        content: ctx.request.body.content,
        options: ctx.request.body.options,
        timestamp: new Date(),
    }
    await chat.messages.push(message)
    await chat.save()


    // 如果雙方有 Socket.io 存在就通知
    if (ctx.sockets[userA.username]) {
        for (let socketid in ctx.sockets[userA.username]) {
            const socket = ctx.sockets[userA.username][socketid]
            if (!socket) {
                continue
            }
            console.log("Notify Socket.io client", {
                username: userA.username,
                socketid
            })
            socket.emit('message', {
                id: message.id,
                sender: userB.username  // 之後會把 key 改為 username
            })
        }
    }
    if (ctx.sockets[userB.username]) {
        for (let socketid in ctx.sockets[userB.username]) {
            const socket = ctx.sockets[userB.username][socketid]
            if (!socket) {
                continue
            }
            console.log("Notify Socket.io client", {
                username: userB.username,
                socketid
            })
            socket.emit('message', {
                id: message.id,
                sender: userA.username  // 之後會把 key 改為 username
            })
        }
    }

    ctx.body = message
})

// GET /api/chat/<username>/message/<messageId>
router.get('/:username/message/:messageId', async ctx => {
    // 如果尚未登入，查看訊息失敗
    if (!ctx.session.login) {
        ctx.body = {
            message: "not logged in."
        }
        ctx.status = 401
        return
    }

    const username = ctx.session.username
    const oppositeUsername = ctx.params.username

    let opposite = await User.findOneByUsername(oppositeUsername)

    // 使用者不存在，查看訊息失敗
    if (!opposite) {
        ctx.body = {
            message: "username does not exist."
        }
        ctx.status = 404
        return
    }

    let userA = await User.findOneByUsername(username)
    let userB = opposite
    let chats = await Chat.findByUsernames(userA.username, userB.username)
    if (!chats.length) {
        // 聊天室不存在，查看訊息失敗
        ctx.body = {
            message: "chatroom does not exist."
        }
        ctx.status = 404
        return
    }

    let chat = chats[0]

    // 聊天室不可見，查看訊息失敗
    if (!chat.visibility) {
        if (chat.userB.username == username) {
            ctx.body = {
                message: "chatroom does not exist."
            }
            ctx.status = 404
            return
        }
    }

    // 取得要查看訊息的 ID
    const messageId = ctx.params.messageId

    // 訊息不存在，查看訊息失敗
    if (messageId > chat.messages.length) {
        ctx.body = {
            message: "message does not exist."
        }
        ctx.status = 404
        return
    }

    // 查看訊息成功
    let message = chat.messages[messageId - 1]

    ctx.body = message
})

module.exports = router
