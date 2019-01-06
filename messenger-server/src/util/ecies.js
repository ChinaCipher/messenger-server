const crypto = require('crypto')
const eccrypto = require('eccrypto')


const generateKeyPair = () => {
    // 亂數產生 EC 私鑰
    let privateKey = crypto.randomBytes(32)
    // 由 EC 私鑰產生公鑰
    let publicKey = eccrypto.getPublic(privateKey)

    // 以 HEX 格式回傳
    return {
        privateKey: privateKey.toString('hex'),
        publicKey: publicKey.toString('hex')
    }
}

// 統一 ECIES 加密的配置
const encrypt = async (key, plaintext) => {
    let ciphertext = await eccrypto.encrypt(Buffer.from(key, 'hex'), Buffer.from(plaintext, 'utf8'))

    // 將密文物件的 Binary 格式資料轉為 HEX 格式
    Object.keys(ciphertext).forEach(key => {
        ciphertext[key] = ciphertext[key].toString('hex')
    });

    return ciphertext
}

// 統一 ECIES 解密的配置
const decrypt = async (key, ciphertext) => {
    // 將密文物件的 HEX 格式資料轉為 Binary 格式
    Object.keys(ciphertext).forEach(key => {
        ciphertext[key] = Buffer.from(ciphertext[key], 'hex')
    });

    let plaintext = await eccrypto.decrypt(Buffer.from(key, 'hex'), ciphertext)
    
    return plaintext.toString('utf8')
}

module.exports = {
    generateKeyPair,
    encrypt,
    decrypt
}