const { createUser_admin, loginUser } = require("../controllers/user-controller")
const { asyncMiddleware, auth, checkPermission } = require("../middlewares")
const permissionString = require("../utils/permissionString");

module.exports = async (app, search, fcm) => {
    app.post("/users/create-admin", [auth, checkPermission(permissionString.CREATE_USER_ADMIN)], asyncMiddleware(createUser_admin, search, fcm));
    app.post("/users/login", asyncMiddleware(loginUser, search, fcm));
}
