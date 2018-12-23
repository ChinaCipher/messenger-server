const http = require('http')
const socketio = require('socket.io')

const sockets = {}

const middleware = () => {
    return async (ctx, next) => {
        if (ctx.session.login) {
            ctx.sockets = sockets[ctx.session.username]
        }
        else {
            ctx.sockets = undefined
        }
        await next()
    }
}

const setupServer = (app) => {
    const server = http.createServer(app.callback())

    const io = socketio(server)

    io.on('connection', socket => {
        console.log('connect')
        const ctx = app.createContext(socket.request, new http.OutgoingMessage())

        if (!ctx.session.login) {
            new Promise((resolve) => {
                setTimeout(() => {
                    resolve()
                }, 3000)
            }).then(() => {
                socket.disconnect()
            })
        }

        if (!sockets[ctx.session.username]) {
            sockets[ctx.session.username] = {}
        }
        sockets[ctx.session.username][ctx.session.id] = socket

        socket.on('disconnect', () => {
            console.log('disconnect')
            const ctx = app.createContext(socket.request, new http.OutgoingMessage())

            if (sockets[ctx.session.username][ctx.session.id]) {
                sockets[ctx.session.username][ctx.session.id] = undefined
            }
        })
    })

    return server
}

module.exports = {
    setupServer,
    middleware
}