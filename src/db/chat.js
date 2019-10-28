const Chat = require('../models/chat')
const Message = require('./message')

class Chatroom {
    constructor(chatdata) {
        this._userA = chatdata.userA
        this._userB = chatdata.userB
        this._visibility = chatdata.visibility
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
    // 搜尋聊天室
    static async find(usernameA, usernameB) {
        let chats = await Chat.findByUsernames(usernameA, usernameB)

        let result = []
        chats.forEach((chat) => {
            result.push(new Chatroom(chat))
        })
        return result
    }
    // 建立聊天室
    static async create(chatdata) {
        await Chat(chatdata).save()
    }
    // 更新聊天室訊息
    async postMessage(msgdata) {
        let chatdata = await Chat.findByUsersname({
            "userA": this._userA,
            "userB": this._userB
        })
        // if (msgdata["id"] === undefined) msgdata["id"] = chatdata.messages[chatdata.messages.length - 1].id + 1
        await chatdata.update({ "$push": { messages: msgdata } })
        let newchatdata = await Chat.findByUsersname({
            "userA": this._userA,
            "userB": this._userB
        })
        this._messages.push(new Message(newchatdata.messages, this._userA.username, this._userB.username))
    }
    // 更新聊天室
    static async _update(usernameA, usernameB, value, option) {
        await Chat.update({
            "$or": [
                { "$and": [{ "userA.username": usernameA }, { "userB.username": usernameB }] },
                { "$and": [{ "userA.username": usernameB }, { "userB.username": usernameA }] }
            ]
        }, { "$set": { [option]: value } })
    }
    // getter and setter
    set userA(value) {
        Chatroom._update(this._userA.username, this._userB.username, value, 'userA')
        this._userA = value
    }

    set userB(value) {
        Chatroom._update(this._userA.username, this._userB.username, value, 'userB')
        this._userB = value
    }

    set visibility(value) {
        Chatroom._update(this._userA.username, this._userB.username, value, 'visibility')
        this._visibility = value
    }

    set messages(value) {
        Chatroom._update(this._userA.username, this._userB.username, value, 'messages')
        this._messages = value
    }

    get userA() {
        return this._userA
    }

    get userB() {
        return this._userB
    }

    get visibility() {
        return this._visibility
    }

    get messages() {
        return this._messages
    }
}

module.exports = Chatroom
