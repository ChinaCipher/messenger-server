const users = require('./models/users')

class User {
    /**
     * @param {Object} user 
     */
    constructor(user){
        this._nickname = user.nickname
        this._username = user.username
        this._password = user.password
        this._avatar = user.avatar

    }

    set username(value){
        update(this._username, value, 'username')
        this._username = value
    }

    set nickname(value){
        if (this !== {}) {
            this._nickname = value
            update(this._username, value, 'nickname')
        }

    }

    set password(value){
        this._password = value
        update(this._username, value, 'password')
    }

    set avatar(value){
        this._avatar = value
        update(this._username, value, 'avatar')
    }

    get username(){
        return this._username
    }
    get nickname(){
        return this._nickname
    }
    get password(){
        return this._password
    }
    get avatar(){
        return this._avatar
    }
}

/**
 * @param {String} username 
 */
async function getuser(username){
    return await users.findOne({ 'username': username })
}

/**
 * @param {String} username 
 * @param {String} nickname 
 */
async function update(username, value, opction){
    const query = {'username': username}
    switch (opction) {
        case 'username':
            await users.update(query, { '$set': {'username': value} })
            break
        case 'nickname':
            await users.update(query, { '$set': {'nickname': value} })
            break
        case 'password':
            await users.update(query, { '$set': {'password': value} })
            break
        case 'avatar':
            await users.update(query, { '$set': {'avatar': value} })
            break
        default:
            break
    }
    // await users.update({ 'username': value }, { '$set': { "nickname": nickname } })
}

/**
 * @param {String} username 
 */
async function init(username){
    const user = await users.findByUsername(username)
    if (user === null){
        return null
    } else {
        return await user
    }
}

module.exports = {
    User,
    init
}