const threads = require('threads')


const encrypt = (plaintext, key, iv) => new Promise((resolve, reject) => {
    const thread = threads.spawn((input, done) => {
        const crypto = require('crypto')
        const encrypt = (plaintext, key, iv) => {
            let cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
            let encrypted = cipher.update(plaintext, 'utf8', 'hex') + cipher.final('hex')
            return encrypted
        }

        let ciphertext = encrypt(input.plaintext, input.key, input.iv)
        done({ ciphertext })
    })

    thread.send({
        plaintext, key, iv
    }).on('error', error => {
        reject(error)
    }).on('message', (response) => {
        thread.kill()
        resolve(response.ciphertext)
    })
})

const decrypt = (ciphertext, key, iv) => new Promise((resolve, reject) => {
    const thread = threads.spawn((input, done) => {
        const crypto = require('crypto')
        const decrypt = (ciphertext, key, iv) => {
            let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
            let decrypted = decipher.update(ciphertext, 'hex', 'utf8') + decipher.final('utf8')
            return decrypted
        }

        let plaintext = decrypt(input.ciphertext, input.key, input.iv)
        done({ plaintext })
    })

    thread.send({
        ciphertext, key, iv
    }).on('error', error => {
        reject(error)
    }).on('message', (response) => {
        thread.kill()
        resolve(response.plaintext)
    })
})

module.exports = {
    encrypt,
    decrypt
}