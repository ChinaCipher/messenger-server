const message = require('./models/messages')

class Chatroom {
    constructor(chatdata) {
        this.messages = chatdata.messages
        this.userA = chatdata.userA
        this.userB = chatdata.userB
    }

    static async find(users, fields) {
        if (fields) {
            return await message.findByUsersname(users, fields)
        }
        else {
            let chatdata = await message.findByUsersname(users)
            return new Chatroom(chatdata)
        }
    }

    static async create(chatdata) {
        await message(chatdata).save()
        let a = await Chatroom.find({ userA: chatdata.userA, userB: chatdata.userB })
        return new Chatroom(a)
    }

    async update(msgdata) {
        let chatdata = await message.findByUsersname({
            "userA": this.userA,
            "userB": this.userB
        })
        if (msgdata["id"] === undefined)msgdata["id"] = chatdata.messages[chatdata.messages.length - 1].id + 1
        await chatdata.update({ "$push": { messages: msgdata } })
        let newchatdata = await message.findByUsersname({
            "userA": this.userA,
            "userB": this.userB
        })
        this.messages = newchatdata.messages
    }
}

module.exports = Chatroom