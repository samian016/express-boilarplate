const { RoleModel, UserModel } = require("../models");
const { INITIAL_ROLES, SUPER_ADMIN } = require("./constants");
const PERMISSION_DATA = require("./permissionData");

function getAppliedPermissions(data) {
    let permissions = data.map((e) => e.permissions).flat()
    let permissionData = {}

    for (let i = 0; i < permissions.length; i++) {
        if (permissions[i].hasPermission) {
            permissionData[permissions[i].permissionName] = permissions[i]
        }
    }
    return permissionData
}
function createPermissionString(data, allPermissions) {
    let permissionString = ""
    let tempPermissionString = ""
    let appliedPermissions = getAppliedPermissions(data)

    let serial = 0
    for (let p in allPermissions) {
        if (appliedPermissions[p]) {
            tempPermissionString += "1"
        } else {
            tempPermissionString += "0"
        }
        serial++
        if (serial == 7) {
            permissionString += String.fromCharCode(
                parseInt(tempPermissionString, 2)
            )
            tempPermissionString = ""
            serial = 0
        }
    }
    if (tempPermissionString.length) {
        if (tempPermissionString.length < 7) {
            tempPermissionString =
                tempPermissionString +
                "0".repeat(7 - tempPermissionString.length)
        }
        permissionString += String.fromCharCode(
            parseInt(tempPermissionString, 2)
        )
    }

    return permissionString
}
const initialStart = async () => {
    try {
        let role = await RoleModel.findOne({ alias: SUPER_ADMIN });
        if (!role) {
            const permissionArray = Object.values(PERMISSION_DATA).map(e => ({ permissions: [{ hasPermission: true, ...e }] }));
            role = await RoleModel.create({
                alias: SUPER_ADMIN,
                hidden: true,
                permissionString: createPermissionString(permissionArray, PERMISSION_DATA),
                deleteAble: false
            });
            role.save();
            console.log("Super Admin role created successfully.");
        } else {
            const permissionArray = Object.values(PERMISSION_DATA).map(e => ({ permissions: [{ hasPermission: true, ...e }] }));
            role.permissionString = createPermissionString(permissionArray, PERMISSION_DATA);
            await role.save();
        }
        let user = await UserModel.findOne({ email: "walidbinjashim@gmail.com" });
        if (!user) {
            user = await UserModel.create({
                full_name: "Md Walid Bin Jashim",
                email: "walidbinjashim@gmail.com",
                password: "12345678",
                role: role?._id?.toString(),
                username: "walid",
                is_admin: true,
                is_verified: true,
            });
            user.save();
            console.log("Super Admin user created successfully.");
        } else {
            user.role = role?._id?.toString();
            await user.save();
        }

        const roles = (await RoleModel.find({ alias: { $in: INITIAL_ROLES } })) || [];
        const available = roles.map(e => e.alias);
        await Promise.all(INITIAL_ROLES.filter(e => !available.includes(e)).map(async e => {
            return RoleModel.create({ alias: e, permissionString: "", deleteAble: false, hidden: false });
        }));
        console.log("Initial setup completed successfully.");


    } catch (err) {
        console.log("Error in initial start", err);
    }
};

exports.initialStart = initialStart;