const { validateSignature } = require("../utils")

module.exports = async (req, res, next) => {
    try {
        const isAuthorized = await validateSignature(req)

        if (isAuthorized) {
            return next()
        }
        return res.status(403).send("Invalid token")
        // throw new AuthorizeError("Not authorized to access resources")
    } catch (error) {
        next(error, req, res)
    }
}
