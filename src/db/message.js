const chatrooms = require('../models/chatrooms')

class Message {
    constructor(msgdata, usernameA, usernameB) {
        this._id = msgdata.id
        this._timestamp = msgdata.timestamp
        this._sender = msgdata.sender
        this._type = msgdata.type
        this._content = msgdata.content
        this._options = msgdata.options
        this._usernameA = usernameA
        this._usernameB = usernameB
    }
    // getter and setter
    get id() {
        return this._id
    }

    get timestamp() {
        return this._timestamp
    }

    get sender() {
        return this._sender
    }

    get type() {
        return this._type
    }

    get content() {
        return this._content
    }

    get options() {
        return this._options
    }

    set id(value) {
        Message._update(value, this._usernameA, this._usernameB, this._id, 'id')
        this._id = value
    }

    set timestamp(value) {
        Message._update(value, this._usernameA, this._usernameB, this._id, 'timestamp')
        this._timestamp = value
    }

    set sender(value) {
        Message._update(value, this._usernameA, this._usernameB, this._id, 'sender')
        this._sender = value
    }

    set type(value) {
        Message._update(value, this._usernameA, this._usernameB, this._id, 'type')
        this._type = value
    }

    set content(value) {
        Message._update(value, this._usernameA, this._usernameB, this._id, 'content')
        this._content = value
    }

    set options(value) {
        Message._update(value, this._usernameA, this._usernameB, this._id, 'options')
        this._options = value
    }

    static async _update(value, usernameA, usernameB, id, option) {
        let o = "messages.$." + option
        await chatrooms.update({ "userA.username": usernameA, "userB.username": usernameB, "messages.id": id },
            { "$set": { [o]: value } })
    }
}
module.exports = Message
