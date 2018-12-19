const crypto = require('crypto')


const encrypt = (plaintext, key, iv) => {
    let cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
    let encrypted = cipher.update(plaintext, 'utf8', 'hex') + cipher.final('hex')
    return encrypted
}

const decrypt = (ciphertext, key, iv) => {
    let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8') + decipher.final('utf8')
    return decrypted
}

module.exports = {
    encrypt,
    decrypt
}