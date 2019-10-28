module.exports = {
    app: {
        port: 8787,
        keys: ["some secret"]
    },
    session: {
        key: "koa:sess",
        maxAge: 86400000
    },
    database: {
        host: "localhost:27017",
        username: "XI",
        password: "ChinaNumberOne"
    }
}
