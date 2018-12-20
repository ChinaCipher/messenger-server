module.exports = {
    app: {
        version: "v1.0.0",
        port: 8787,
        keys: ["some secret hurr"]
    },
    session: {
        key: "koa:sess",
        maxAge: 86400000
    },
    db: {
        user: "CCMadmin",
        pwd: "test123",
        db: "CCM"
    }
}