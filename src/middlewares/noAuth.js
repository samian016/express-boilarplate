
module.exports = async (req, res, next) => {
    try {
        return next()
        // throw new AuthorizeError("Not authorized to access resources")
    } catch (error) {
        next(error, req, res)
    }
}
