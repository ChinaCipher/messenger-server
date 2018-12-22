const chatrooms = require('./models/chatrooms')
const Message = require('./message')

class Chatroom {
    constructor(chatdata) {
        this._userA = chatdata.userA
        this._userB = chatdata.userB
        this._messages = []
        chatdata.messages.forEach((message) => {
            this._messages.push(new Message(message, this._userA.username, this._userB.username))
        })
    }

    /**
     * 
     * @param {String} usernameA 
     * @param {String} usernameB 
     * @param {String} fields 
     */
    static async find(usernameA, usernameB, fields) {
        let chatroomList = null
        if (usernameB === null) {
            chatroomList = await chatrooms.find({
                "$or": [{ "userA.username": usernameA }, { "userB.username": usernameA }]
            }, fields)
        }
        else {
            chatroomList = await chatrooms.find({
                "$or": [{
                    "$and": [{ "userA.username": usernameA }, { "userB.username": usernameB }]
                }, {
                    "$and": [{ "userA.username": usernameB }, { "userB.username": usernameA }]
                }]
            }, fields)
        }

        let result = []
        chatroomList.forEach((chatroom) => {
            result.push(new Chatroom(chatroom))
        })

        return result
    }

    static async create(chatdata) {
        await message(chatdata).save()
    }

    async postMessage(msgdata) {
        let chatdata = await chatrooms.findByUsersname({
            "userA": this._userA,
            "userB": this._userB
        })
        // if (msgdata["id"] === undefined) msgdata["id"] = chatdata.messages[chatdata.messages.length - 1].id + 1
        await chatdata.update({ "$push": { messages: msgdata } })
        let newchatdata = await chatrooms.findByUsersname({
            "userA": this._userA,
            "userB": this._userB
        })
        this._messages.push(new Message(newchatdata.messages, this._userA.username, this._userB.username))
    }


    set userA(value) {
        this._userA = value
    }

    set userB(value) {
        this._userB = value
    }

    set messages(value) {
        this._messages = value
    }


    get userA() {
        return this._userA
    }

    get userB() {
        return this._userB
    }

    get messages() {
        return this._messages
    }
}

module.exports = Chatroom