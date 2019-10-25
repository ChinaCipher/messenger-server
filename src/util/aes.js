const crypto = require('crypto')


// 統一採用 AES 256 bit 金鑰長度 CBC 模式加密
const encrypt = (plaintext, key, iv) => {
    let cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
    // 將 UTF-8 原文加密後轉為 HEX 格式回傳
    let encrypted = cipher.update(plaintext, 'utf8', 'hex') + cipher.final('hex')
    return encrypted
}

// 統一採用 AES 256 bit 金鑰長度 CBC 模式解密
const decrypt = (ciphertext, key, iv) => {
    let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
    // 將 HEX 密文解密後轉為 UTF-8 格式回傳
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8') + decipher.final('utf8')
    return decrypted
}

module.exports = {
    encrypt,
    decrypt
}