const message = require('./models/chatroom')

class Chatroom {
    constructor(chatdata) {
        this._messages = chatdata.messages
        this._userA = chatdata.userA
        this._userB = chatdata.userB
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

        if (chatrooms.length === 0) return null

        let chatroomList = []
        chatrooms.forEach((chatroom) => {
            chatroomList.push(new Chatroom(chatroom))
        })

        return chatroomList
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
}

module.exports = Chatroom