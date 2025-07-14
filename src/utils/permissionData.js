const PERMISSIONS = require("./permissionString.js")

const PERMISSION_DATA = {
    // Role
    READ_ROLES: {
        moduleName: "Role",
        permissionNumber: 0,
        permissionName: PERMISSIONS.READ_ROLES,
    },
    CREATE_ROLE: {
        moduleName: "Role",
        permissionNumber: 1,
        permissionName: PERMISSIONS.CREATE_ROLE,
    },
    UPDATE_ROLE: {
        moduleName: "Role",
        permissionNumber: 2,
        permissionName: PERMISSIONS.UPDATE_ROLE,
    },
    READ_SINGLE_ROLE: {
        moduleName: "Role",
        permissionNumber: 3,
        permissionName: PERMISSIONS.READ_SINGLE_ROLE,
    },
    DELETE_ROLE: {
        moduleName: "Role",
        permissionNumber: 4,
        permissionName: PERMISSIONS.DELETE_ROLE,
    },

    // User
    CREATE_USER_ADMIN: {
        moduleName: "User",
        permissionNumber: 5,
        permissionName: PERMISSIONS.CREATE_USER_ADMIN
    },

}

module.exports = PERMISSION_DATA;
