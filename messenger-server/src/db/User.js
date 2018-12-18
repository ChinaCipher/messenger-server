const users = require('./models/users')

class User {
    /**
     * @param {Object} user 
     */
    constructor(user) {
        this._nickname = user.nickname
        this._username = user.username
        this._password = user.password
        this._avatar = user.avatar
    }

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

    static async _update(username, value, opction) {
        await users.update({ username }, { '$set': { [opction]: value } })
    }

    static async find(username) {
        let user = await users.findByUsername(username)
        return new User(user)
    }

    static async create(user) {
        await users(user).save(err => {
            if (err) throw new Error(err)
        })
    }
}

module.exports = User