const bcrypt = require('bcryptjs')
const Router = require('koa-router')

const User = require('../db/user')
const aes = require('../util/aes')
const ecies = require('../util/ecies')
const sha256 = require('../util/sha256')

const router = new Router()


// POST /api/user
router.post('/', async ctx => {
    // 取得帳號和明文密碼
    const username = ctx.request.body.username
    const secret = ctx.request.body.secret

    let user = await User.find(username)
    if (user) {
        // 已經有這個使用者，註冊失敗
        ctx.body = {
            message: "username was already taken."
        }
        ctx.status = 401
        return
    }

    if (!secret || (secret.length < 8) || (secret.length > 30)) {
        // 密碼長度不符合要求，註冊失敗
        ctx.body = {
            message: "password must be longer than 3 and shorter than 30."
        }
        ctx.status = 401
        return
    }

    // 產生使用者 EC 公私鑰對
    let pair = ecies.generateKeyPair()
    // 使用帳號和明文密碼做 AES 加密的 key 和 iv
    let key = sha256.hash(secret).slice(0, 32)
    let iv = sha256.hash(username).slice(0, 16)

    let profile = {
        username,
        // 將明文密碼採用 bcrypt 雜湊後儲存
        password: await bcrypt.hash(secret, '$2b$10$' + sha256.hash(username).slice(0, 22)),
        nickname: username,
        avatar: 'img/default_avatar.png',
        publicKey: pair.publicKey,
        // 將 EC 私鑰採用 AES 加密後儲存
        privateKey: aes.encrypt(pair.privateKey, key, iv)
    }

    try {
        await User.create(profile)
    }
    catch (e) {
        // 發生資料庫驗證錯誤，註冊失敗
        ctx.body = {
            message: "database validation error occurred."
        }
        ctx.status = 401
        return
    }

    // 註冊成功
    user = await User.find(username)

    ctx.body = {
        avatar: user.avatar,
        username: user.username,
        nickname: user.nickname
    }
    ctx.status = 201
})

// GET /api/user/<username>
router.get('/:username', async ctx => {
    const username = ctx.params.username

    let user = await User.find(username)
    if (!user) {
        // 使用者不存在，查詢使用者失敗
        ctx.body = {
            message: "username does not exist."
        }
        ctx.status = 404
        return
    }

    // 查詢使用者成功
    ctx.body = {
        avatar: user.avatar,
        username: user.username,
        nickname: user.nickname
    }
})

// PATCH /api/user/<username>
router.patch('/:username', async ctx => {
    // 取得要更新的使用者名稱
    const username = ctx.params.username
    // 取得要更新的資訊
    const nickname = ctx.request.body.nickname
    const avatar = ctx.request.body.avatar

    if (!ctx.session.login) {
        // 尚未登入，更新資訊失敗
        ctx.body = {
            message: "not logged in."
        }
        ctx.status = 401
        return
    }

    let user = await User.find(username)
    if (!user) {
        // 使用者不存在，更新資訊失敗
        ctx.body = {
            message: "username does not exist."
        }
        ctx.status = 404
        return
    }

    if (username != ctx.session.username) {
        // 沒有權限，更新資訊失敗
        ctx.body = {
            message: "permission denied."
        }
        ctx.status = 403
        return
    }

    // 更新資訊成功
    if (nickname) {
        // 設定暱稱
        user.nickname = nickname
    }
    if (avatar) {
        // 設定大頭貼
        user.avatar = avatar
    }

    ctx.body = {
        avatar: user.avatar,
        username: user.username,
        nickname: user.nickname
    }
})

// PATCH /api/user/<username>/password
router.patch('/:username/password', async ctx => {
    // 取得要更新的使用者名稱
    const username = ctx.params.username
    // 取得該使用者舊密碼與新密碼
    const oldSecret = ctx.request.body.oldSecret
    const newSecret = ctx.request.body.newSecret

    if (!ctx.session.login) {
        // 尚未登入，更新密碼失敗
        ctx.body = {
            message: "not logged in."
        }
        ctx.status = 401
        return
    }

    let user = await User.find(username)
    if (!user) {
        // 使用者不存在，更新密碼失敗
        ctx.body = {
            message: "username does not exist."
        }
        ctx.status = 404
        return
    }

    if (username != ctx.session.username) {
        // 沒有權限，更新密碼失敗
        ctx.body = {
            message: "permission denied."
        }
        ctx.status = 403
        return
    }

    if (!newSecret || (newSecret.length < 8) || (newSecret.length > 30)) {
        // 新密碼長度不符合要求，更新密碼失敗
        ctx.body = {
            message: "password must be longer than 3 and shorter than 30."
        }
        ctx.status = 401
        return
    }

    let oldPassword = await bcrypt.hash(oldSecret, '$2b$10$' + sha256.hash(username).slice(0, 22))
    if (oldPassword != user.password) {
        // 舊密碼使用 bcrypt 雜湊後的結果不符合，更新密碼失敗
        ctx.body = {
            message: "wrong password."
        }
        ctx.status = 401
        return
    }

    // 更新密碼成功
    user.password = await bcrypt.hash(newSecret, '$2b$10$' + sha256.hash(username).slice(0, 22))

    let oldKey = sha256.hash(oldSecret).slice(0, 32)
    let newKey = sha256.hash(newSecret).slice(0, 32)
    let iv = sha256.hash(username).slice(0, 16)

    // 將使用者私鑰用舊密碼解密後用新密碼加密
    user.privateKey = aes.encrypt(aes.decrypt(user.privateKey, oldKey, iv), newKey, iv)

    ctx.status = 204
})

module.exports = router