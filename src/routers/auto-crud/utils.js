exports.getAuthMiddleware = (op, params) => {
    let { mode, auth, permissionString, checkPermission } = params
    let action = ""
    switch (op) {
        case "C":
            action = "CREATE"
            break
        case "R":
            action = "READ"
            break
        case "S":
            action = "READ_SINGLE"
            break
        case "U":
            action = "UPDATE"
            break
        case "D":
            action = "DELETE"
            break
    }
    let authMiddleWare = []
    if (!mode.includes(`${op}p`)) {
        if (action == "READ") {
            permissionString =
                permissionString === "" ? "" : `${permissionString}S`
        }
        authMiddleWare = [
            auth,
            checkPermission(
                permissionString === "" ? "" : `${action}_${permissionString}`
            )
        ]
    }
    return authMiddleWare
}
