const { hasPermission } = require("../utils")
const { AuthorizeError } = require("../utils/errors/app-error")

module.exports = (operationName) => {
    return async (req, _, next) => {
        try {
            if (operationName === "") {
                return next()
            }
            if (hasPermission(operationName, req.user?.role?.permissionString))
                return next()
            else {
                throw new AuthorizeError("Not authorized to access resources")
            }
        } catch (error) {
            next(error)
        }
    }
}
