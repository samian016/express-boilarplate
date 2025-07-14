const { getAuthMiddleware } = require("./utils")

const autoCrud = (
    app,
    {
        path,
        mode = "CRSUD",
        service,
        auth,
        checkPermission,
        permissionString = ""
    },
    search = null,
    fcm = null
) => {
    const middlewaresData = {
        auth,
        mode,
        checkPermission,
        permissionString
    }

    if (mode.includes("R")) {
        app.get(
            `/${path}`,
            getAuthMiddleware("R", middlewaresData),
            middlewares(async (req, res, _search, _service, _ws) => {
                const data = await _service.getAll(req, _search, _ws)
                return res.json(data)
            }, service, search, fcm)
        )
    }

    if (mode.includes("C")) {
        app.post(
            `/${path}/create`,
            getAuthMiddleware("C", middlewaresData),
            middlewares(async (req, res, _search, _service, _ws) => {
                const data = await _service.create(req, _search, _ws)
                return res.json(data)
            }, service, search, fcm)
        )
    }

    if (mode.includes("S")) {
        app.get(
            `/${path}/id/:id`,
            getAuthMiddleware("S", middlewaresData),
            middlewares(async (req, res, _search, _service, _ws) => {
                const data = await _service.findById(req.params?.id, req, _search, _ws)
                return res.json(data)
            }, service, search, fcm)
        )
    }

    if (mode.includes("S")) {
        app.get(
            `/${path}/single`,
            getAuthMiddleware("S", middlewaresData),
            middlewares(async (req, res, _search, _service, _ws) => {
                const data = await _service.findOne(req.query, req, _search, _ws)
                return res.json(data)
            }, service, search, fcm)
        )
    }

    if (mode.includes("U")) {
        app.put(
            `/${path}/update/:id`,
            getAuthMiddleware("U", middlewaresData),
            middlewares(async (req, res, _search, _service, _ws) => {
                const data = await _service.updateById(req.params.id, req, _search, _ws)
                return res.json(data)
            }, service, search, fcm)
        )
    }

    if (mode.includes("D")) {
        app.delete(
            `/${path}/delete/:id`,
            getAuthMiddleware("D", middlewaresData),
            middlewares(async (req, res, _search, _service, _ws) => {
                const data = await _service.deleteById(req.params.id, req, _search, _ws)
                return res.json(data)
            }, service, search, fcm)
        )
    }
}

const middlewares = (handler, service, search, fcm) => {
    return async function (req, res, next) {
        try {
            await handler(req, res, search, service, fcm)
        } catch (ex) {
            next(ex, req, res)
        }
    }
}

module.exports = autoCrud
