const {
    getAllRoles,
    createRole,
    updateRole,
    getRoleById,
    getAllPermissions,
    deleteRole,
} = require("../controllers/role-controller")
const { asyncMiddleware, auth, checkPermission } = require("../middlewares")
const permissionString = require("../utils/permissionString")

module.exports = (app) => {
    app.get("/roles", [auth, checkPermission(permissionString.READ_ROLES)], asyncMiddleware(getAllRoles))

    app.post("/role/create", [auth, checkPermission(permissionString.CREATE_ROLE)], asyncMiddleware(createRole))

    app.put("/role/update/:id", [auth, checkPermission(permissionString.UPDATE_ROLE)], asyncMiddleware(updateRole))

    app.get("/role/id/:id", [auth, checkPermission(permissionString.READ_SINGLE_ROLE)], asyncMiddleware(getRoleById))

    app.delete("/role/delete/:id", [auth, checkPermission(permissionString.DELETE_ROLE)], asyncMiddleware(deleteRole))

    app.get("/role/all-permissions", [auth], asyncMiddleware(getAllPermissions))
}
