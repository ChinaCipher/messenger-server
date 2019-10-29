const http = require('http')
const socketio = require('socket.io')

const sockets = {}

const middleware = () => {
    return async (ctx, next) => {
        ctx.sockets = sockets
        await next()
    }
}

const setupServer = (app) => {
    const server = http.createServer(app.callback())

    const io = socketio(server)

    io.on('connection', socket => {
        const ctx = app.createContext(socket.request, new http.OutgoingMessage())
        console.log("Socket.io client connected!", {
            username: ctx.session.username,
            id: ctx.session.id
        })

        if (!ctx.session.login) {
            setTimeout(() => {
                socket.disconnect()
            }, 3000)
        }

        if (!sockets[ctx.session.username]) {
            sockets[ctx.session.username] = {}
        }
        sockets[ctx.session.username][ctx.session.id] = socket

        socket.on('disconnect', () => {
            const ctx = app.createContext(socket.request, new http.OutgoingMessage())
            console.log("Socket.io client disconnected!", {
                username: ctx.session.username,
                id: ctx.session.id
            })

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