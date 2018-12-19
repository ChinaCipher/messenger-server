const crypto = require('crypto')


const hash = (text) => {
    return  crypto.createHash('sha256').update(text).digest('hex')
}

module.exports = {
    hash
}