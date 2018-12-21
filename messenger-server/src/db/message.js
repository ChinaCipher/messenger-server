const message = require('./models/chatrooms')

class Message {
    constructor(msgdata, usernameA, usernameB) {
        this._id = msgdata.id
        this._sender = msgdata.sender
        this._type = msgdata.type
        this._content = msgdata.content
        this._options = msgdata.options
        this._usernameA = usernameA
        this._usernameB = usernameB
    }

    get id() {
        return this._id
    }

    get content() {
        return this._content
    }

    set content(value) {
        this._content = value
        Message._update(value, this._usernameA, this._usernameB, this._id, 'content')
    }

    get type() {
        return this._type
    }

    set type(value) {
        this._type = value
        Message._update(value, this._usernameA, this._usernameB, this._id, 'type')
    }


    get options() {
        return this._options
    }

    set options(value) {
        this._options = value
        Message._update(value, this._usernameA, this._usernameB, this._id, 'options')
    }

    static async _update(value, usernameA, usernameB, id, option) {
        let o = "messages.$." + option
        await message.update({ "userA.username": usernameA, "userB.username": usernameB, "messages.id": id },
            { "$set": { [o]: value } })
    }
}
module.exports = Message
