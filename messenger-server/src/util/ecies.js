const crypto = require('crypto')
const eccrypto = require('eccrypto')


const generateKeyPair = () => {
    let privateKey = crypto.randomBytes(32)
    let publicKey = eccrypto.getPublic(privateKey)

    return {
        privateKey: privateKey.toString('hex'),
        publicKey: publicKey.toString('hex')
    }
}

const encrypt = async (key, plaintext) => {
    let ciphertext = await eccrypto.encrypt(Buffer.from(key, 'hex'), Buffer.from(plaintext, 'utf8'))

    Object.keys(ciphertext).forEach(key => {
        ciphertext[key] = ciphertext[key].toString('hex')
    });

    return ciphertext
}

const decrypt = async (key, ciphertext) => {
    Object.keys(ciphertext).forEach(key => {
        ciphertext[key] = Buffer.from(ciphertext[key], 'hex')
    });

    let plaintext = (await eccrypto.decrypt(Buffer.from(key, 'hex'), ciphertext)).toString('utf8')

    return plaintext
}

module.exports = {
    generateKeyPair,
    encrypt,
    decrypt
}