const crypto = require('crypto')


// 統一設定 SHA 256 雜湊的配置
const hash = (text) => {
    return  crypto.createHash('sha256').update(text).digest('hex')
}

module.exports = {
    hash
}