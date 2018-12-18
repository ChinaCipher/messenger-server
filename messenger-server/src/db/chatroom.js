const message = require('./models/messages')

class Chatroom {
    constructor(chatdata) {
        this.messages = chatdata.messages
        this.userA = chatdata.userA
        this.userB = chatdata.userB
    }

    // static async find(users) {
    //     let chatdata = await message.findByUsersname(users)
    //     return new Chatroom(chatdata)
    // }


    static async create(chatdata) {
        await message(chatdata).save()
        return await Chatroom.find({ userA: chatdata.userA, userB: chatdata.userB })
    }
}

module.exports = Chatroom