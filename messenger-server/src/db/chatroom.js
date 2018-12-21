const message = require('./models/chatrooms')
const msg = require('./message')

class Chatroom {
    constructor(chatdata) {
        this._userA = chatdata.userA
        this._userB = chatdata.userB
        this._messages = []
        chatdata.messages.forEach((message) => {
            this._messages.push(new msg(message, this._userA.username, this._userB.username))
        })
    }

    /**
     * 
     * @param {String} usernameA 
     * @param {String} usernameB 
     * @param {String} fields 
     */
    static async find(usernameA, usernameB, fields) {
        let chatrooms = null
        if (usernameB === null) {
            chatrooms = await message.find({
                "$or": [{ "userA.username": usernameA }, { "userB.username": usernameA }]
            }, fields)
        }
        else {
            chatrooms = await message.find({
                "$and": [{ "userA.username": usernameA }, { "userB.username": usernameB }]
            }, fields)
        }

        let result = []
        chatrooms.forEach((chatroom) => {
            result.push(new Chatroom(chatroom))
        })

        return result
    }

    static async create(chatdata) {
        await message(chatdata).save()
    }

    async update(msgdata) {
        let chatdata = await message.findByUsersname({
            "userA": this._userA,
            "userB": this._userB
        })
        if (msgdata["id"] === undefined) msgdata["id"] = chatdata.messages[chatdata.messages.length - 1].id + 1
        await chatdata.update({ "$push": { messages: msgdata } })
        let newchatdata = await message.findByUsersname({
            "userA": this._userA,
            "userB": this._userB
        })
        this._messages = newchatdata.messages
    }


    set userA(value) {
        this._userA = value
    }

    set usernameB(value) {
        this._userB = value
    }

    set messages(value) {
        this._messages = value
    }


    get userA() {
        return this._userA
    }

    get usernameB() {
        return this._userB
    }

    get messages() {
        return this._messages
    }
}

module.exports = Chatroom