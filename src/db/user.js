const users = require('../models/user')

class User {
    /**
     * @param {Object} user
     */
    constructor(user) {
        this._nickname = user.nickname
        this._username = user.username
        this._password = user.password
        this._avatar = user.avatar
        this._publicKey = user.publicKey
        this._privateKey = user.privateKey
    }
    // getter and setter
    set username(value) {
        User._update(this._username, value, 'username')
        this._username = value
    }

    set nickname(value) {
        User._update(this._username, value, 'nickname')
        this._nickname = value
    }

    set password(value) {
        User._update(this._username, value, 'password')
        this._password = value
    }

    set avatar(value) {
        User._update(this._username, value, 'avatar')
        this._avatar = value
    }

    set publicKey(value) {
        User._update(this._username, value, 'publicKey')
        this._publicKey = value
    }

    set privateKey(value) {
        User._update(this._username, value, 'privateKey')
        this._privateKey = value
    }

    get username() {
        return this._username
    }
    get nickname() {
        return this._nickname
    }
    get password() {
        return this._password
    }
    get avatar() {
        return this._avatar
    }
    get publicKey() {
        return this._publicKey
    }
    get privateKey() {
        return this._privateKey
    }
    // 更新使用者資料
    static async _update(username, value, opction) {
        await users.update({ username }, { '$set': { [opction]: value } })
    }
    // 搜尋使者
    static async find(username) {
        let user = await users.find(username)
        if (!user) {
            return null
        }
        return new User(user)
    }
    // 建立使用者
    static async create(user) {
        await users(user).save()
    }
}

module.exports = User
