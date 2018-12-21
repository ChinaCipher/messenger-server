const message = require('./models/messages')

class Chatroom {
    constructor(chatdata) {
        this._messages = chatdata.messages
        this._userA = chatdata.userA
        this._userB = chatdata.userB
    }

    static async find(users, fields) {
        if (fields) {
            let chatdata = await message.findByUsersname(users, fields)
            if (chatdata === null) return null
            return new Chatroom(chatdata)
        }
        else {
            let chatdata = await message.findByUsersname(users)
            if (chatdata === null) return null
            return new Chatroom(chatdata)
        }
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

    static async findChatroomsByOneUser(username) {
        let chatRooms = await message.find({
            "$or": [{ "userA.username": username }, { "userB.username": username }]
        })
        return chatRooms
    }
}

module.exports = Chatroom