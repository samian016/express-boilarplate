module.exports = function (handler, search, fcm) {
    return async function (req, res, next) {
        try {
            if (req.query.dateFrom) {
                let from = new Date(req.query.dateFrom)
                from.setUTCHours(18, 0, 0, 0)
                req.query.dateFrom = from
            }
            if (req.query.dateTo) {
                let to = new Date(req.query.dateTo)
                to.setUTCHours(17, 59, 59, 0) // Reset time to start of day
                req.query.dateTo = to
            }

            await handler(req, res, search, fcm)
        } catch (ex) {
            console.log("Throwing error from async middleware.", ex)
            next(ex)
        }
    }
}
