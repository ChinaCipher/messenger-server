const crypto = require('crypto')
const Router = require('koa-router')

const User = require('../models/user')
const Chat = require('../db/chat')
const ecies = require('../util/ecies')

const router = new Router()


// GET /api/chat
router.get('/', async ctx => {
    if (!ctx.session.login) {
        ctx.body = {
            // 尚未登入，查詢聊天室列表失敗
            message: "not logged in."
        }
        ctx.status = 401
        return
    }

    const data = await Chat.find(ctx.session.username, null)

    let result = []
    for (const index in data) {
        let room = data[index]

        // 跳過已存在但不可見的聊天室
        if (!room.visibility) {
            if (room.userB.username == ctx.session.username) {
                continue
            }
        }

        // 取得對方使用者物件
        let user = null
        if (room.userA.username == ctx.session.username) {
            user = await User.findOne({ username: room.userB.username })
        }
        else {
            user = await User.findOne({ username: room.userA.username })
        }

        // 加入結果陣列中
        result.push({
            avatar: user.avatar,
            username: user.username,
            nickname: user.nickname
        })
    }

    // 查詢聊天室列表成功
    ctx.body = {
        rooms: result
    }
})

// POST /api/chat
router.post('/', async ctx => {
    // 取得要建立聊天室對象的帳號
    const username = ctx.request.body.username

    if (!ctx.session.login) {
        // 尚未登入，建立聊天室失敗
        ctx.body = {
            message: "not logged in."
        }
        ctx.status = 401
        return
    }

    let user = await User.findOne({ username })
    if (!user) {
        // 使用者不存在，建立聊天室失敗
        ctx.body = {
            message: "username does not exist."
        }
        ctx.status = 404
        return
    }

    // 取得聊天雙方的使用者物件
    let userA = await User.findOne({ username: ctx.session.username })
    let userB = user
    let rooms = await Chat.find(userA.username, userB.username)
    if (rooms.length) {
        let room = rooms[0]

        if (!room.visibility) {
            // 聊天室已建立但不可見，直接回傳訊息金鑰
            if (room.userA.username == ctx.session.username) {
                ctx.body = {
                    messageKey: room.userA.messageKey
                }
            }
            else {
                ctx.body = {
                    messageKey: room.userB.messageKey
                }
                room.visibility = true
            }
            return
        }

        ctx.body = {
            // 聊天室已建立且可見，建立聊天室失敗
            message: "chatroom already exists."
        }
        ctx.status = 403
        return
    }

    // 產生訊息金鑰
    let originalMessageKey = crypto.randomBytes(32).toString('hex').slice(0, 32)

    // 以對話雙方使用者之 EC 公鑰加密
    let room = {
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
    await Chat.create(room)

    ctx.body = {
        messageKey: room.userA.messageKey
    }
})

// GET /api/chat/<username>
router.get('/:username', async ctx => {
    // 取得要查詢聊天室對象的帳號
    const username = ctx.params.username

    if (!ctx.session.login) {
        // 尚未登入，查詢聊天室失敗
        ctx.body = {
            message: "not logged in."
        }
        ctx.status = 401
        return
    }

    let user = await User.findOne({ username })
    if (!user) {
        // 使用者不存在，查詢聊天室失敗
        ctx.body = {
            message: "username does not exist."
        }
        ctx.status = 404
        return
    }

    let userA = await User.findOne({ username: ctx.session.username })
    let userB = user
    let rooms = await Chat.find(userA.username, userB.username)
    if (!rooms.length) {
        // 聊天室不存在，查詢聊天室失敗
        ctx.body = {
            message: "chatroom does not exist."
        }
        ctx.status = 404
        return
    }

    let room = rooms[0]

    if (!room.visibility) {
        // 聊天室不可見，查詢聊天室失敗
        if (room.userB.username == ctx.session.username) {
            ctx.body = {
                message: "chatroom does not exist."
            }
            ctx.status = 404
            return
        }
    }

    // 查詢聊天室成功
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

// GET /api/chat/<username>/message
router.get('/:username/message', async ctx => {
    // 取得要查詢聊天室訊息對象的帳號
    const username = ctx.params.username
    // 取得檢索參數
    let index = ctx.query.index
    let count = ctx.query.count

    if (!ctx.session.login) {
        // 尚未登入，查詢聊天室訊息失敗
        ctx.body = {
            message: "not logged in."
        }
        ctx.status = 401
        return
    }

    let user = await User.findOne({ username })
    if (!user) {
        // 使用者不存在，查詢聊天室訊息失敗
        ctx.body = {
            message: "username does not exist."
        }
        ctx.status = 404
        return
    }

    let userA = await User.findOne({ username: ctx.session.username })
    let userB = user
    let rooms = await Chat.find(userA.username, userB.username)
    if (!rooms.length) {
        // 聊天室不存在，查詢聊天室訊息失敗
        ctx.body = {
            message: "chatroom does not exist."
        }
        ctx.status = 404
        return
    }

    let room = rooms[0]

    if (!room.visibility) {
        // 聊天室不可見，查詢聊天室訊息失敗
        if (room.userB.username == ctx.session.username) {
            ctx.body = {
                message: "chatroom does not exist."
            }
            ctx.status = 404
            return
        }
    }

    let messages = room.messages

    // 設定預設的檢索條件
    index = index || messages.length
    count = count || 1

    // 取出特定範圍的訊息
    messages = messages.slice(Math.max(0, index - count), index)

    let result = []
    messages.forEach(message => {
        result.push({
            id: message.id,
            sender: message.sender,
            type: message.type,
            content: message.content,
            options: message.options,
            // Getter 是否存在待確認
            timestamp: message._timestamp
        })
    });

    // 查詢聊天室訊息成功
    ctx.body = {
        messages: result
    }
})

// POST /api/chat/<username>/message
router.post('/:username/message', async ctx => {
    // 取得要發送訊息對象的帳號
    const username = ctx.params.username
    // 取得要發送的訊息資訊
    const type = ctx.request.body.type
    const content = ctx.request.body.content
    const options = ctx.request.body.options

    if (!ctx.session.login) {
        // 尚未登入，發送訊息失敗
        ctx.body = {
            message: "not logged in."
        }
        ctx.status = 401
        return
    }

    let user = await User.findOne({ username })
    if (!user) {
        // 使用者不存在，發送訊息失敗
        ctx.body = {
            message: "username does not exist."
        }
        ctx.status = 404
        return
    }

    let userA = await User.findOne({ username: ctx.session.username })
    let userB = user
    let rooms = await Chat.find(userA.username, userB.username)
    if (!rooms.length) {
        // 聊天室不存在，發送訊息失敗
        ctx.body = {
            message: "chatroom does not exist."
        }
        ctx.status = 404
        return
    }

    let room = rooms[0]

    if (!room.visibility) {
        // 聊天室不可見，發送訊息失敗
        if (room.userB.username == ctx.session.username) {
            ctx.body = {
                message: "chatroom does not exist."
            }
            ctx.status = 404
            return
        }
        else {
            room.visibility = true
        }
    }

    // 發送訊息成功
    let id = room.messages.length + 1

    let sender = ctx.session.username

    let timestamp = new Date()

    let message = {
        id,
        sender,
        type,
        content,
        options,
        timestamp
    }

    await room.postMessage(message)


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
                id,
                // 之後會改名叫做 username
                sender: userB.username
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
                id,
                // 之後會改名叫做 username
                sender: userA.username
            })
        }
    }

    ctx.body = message
})

// GET /api/chat/<username>/message/<messageId>
router.get('/:username/message/:messageId', async ctx => {
    // 取得要查看訊息對象的帳號
    const username = ctx.params.username
    // 取得要查看訊息的 ID
    const messageId = ctx.params.messageId

    if (!ctx.session.login) {
        // 尚未登入，查看訊息失敗
        ctx.body = {
            message: "not logged in."
        }
        ctx.status = 401
        return
    }

    let user = await User.findOne({ username })
    if (!user) {
        // 使用者不存在，查看訊息失敗
        ctx.body = {
            message: "username does not exist."
        }
        ctx.status = 404
        return
    }

    let userA = await User.findOne({ username: ctx.session.username })
    let userB = user
    let rooms = await Chat.find(userA.username, userB.username)
    if (!rooms.length) {
        // 聊天室不存在，查看訊息失敗
        ctx.body = {
            message: "chatroom does not exist."
        }
        ctx.status = 404
        return
    }

    let room = rooms[0]

    if (!room.visibility) {
        // 聊天室不可見，查看訊息失敗
        if (room.userB.username == ctx.session.username) {
            ctx.body = {
                message: "chatroom does not exist."
            }
            ctx.status = 404
            return
        }
    }

    if (messageId > room.messages.length) {
        // 訊息不存在，查看訊息失敗
        ctx.body = {
            message: "message does not exist."
        }
        ctx.status = 404
        return
    }


    // 查看訊息成功
    let message = room.messages[messageId - 1]

    ctx.body = {
        id: message.id,
        sender: message.sender,
        type: message.type,
        content: message.content,
        options: message.options,
        // Getter 是否存在待確認
        timestamp: message._timestamp
    }
})

module.exports = router
