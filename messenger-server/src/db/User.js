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
        this._nickname = value
        User._update(this._username, value, 'nickname')
    }

    set password(value) {
        this._password = value
        User._update(this._username, value, 'password')
    }

    set avatar(value) {
        this._avatar = value
        User._update(this._username, value, 'avatar')
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

    static async findUser(username) {
        return await users.findByUsername(username)
    }

    static async _update(username, value, opction) {
        await users.update({username}, {'$set': {[opction]: value}})
    }

}

module.exports = User