module.exports = {
    app: {
        port: 8787,
        keys: ["some secret hurr"]
    },
    session: {
        key: "koa:sess",
        maxAge: 86400000
    },
    database: {
        host: "localhost:27017",
        user: "XI",
        pswd: "ChinaNumberOne"
    }
}