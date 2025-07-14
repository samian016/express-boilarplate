class RoleService {
    constructor({ repository, Model, errorHandler, userRepository }) {
        this.repository = repository
        this.Model = Model
        this.errorHandler = errorHandler
        this.userRepository = userRepository
    }

    async getAllRoles(data) {
        return await this.repository.findAllRole(data)
    }

    async deleteRole(id) {
        const role = await this.repository.findRoleById(id);
        const exist = await this.userRepository.findOne({ role: id });
        if (exist) throw new this.errorHandler.ValidationError("This role is already in use.");
        if (!role.deleteAble) throw new this.errorHandler.ValidationError("This role can not be deleted.");
        return await this.repository.deleteRole(id);
    }

    async getOne(data) {
        return await this.repository.findOne(data)
    }

    async createRole(data, allPermissions) {
        const role = this.getCleanData(data)
        const { error } = this.Model().validate(role)
        if (error) {
            throw new this.errorHandler.ValidationError(error.message)
        }

        const alreadyExists = await this.repository.findOne({
            alias: data.alias
        })
        if (alreadyExists) {
            throw new this.errorHandler.AlreadyExistsError(
                "Role with this alias is already exists."
            )
        }
        return await this.repository.createRole({
            alias: data.alias,
            permissionString: this.createPermissionString(
                data.permissionList ?? [],
                allPermissions
            ),
            ...data.hidden && { hidden: data.hidden }
        })
    }

    async updateRole(id, data, allPermissions) {
        const role = this.getCleanData(data)
        const { error } = this.Model().validate(role);

        if (error) {
            throw new this.errorHandler.ValidationError(error.message)
        }

        return await this.repository.updateRole(id, {
            alias: data.alias,
            permissionString: this.createPermissionString(
                data.permissionList ?? [],
                allPermissions
            )
        })
    }

    async getRoleById(id, { allPermissions, hasPermission }) {
        const role = await this.repository.findRoleById(id)
        if (!role) {
            throw new this.errorHandler.NotFoundError("Role not found.")
        }

        const permissionString = role.permissionString

        let permissions = []
        for (let p in allPermissions) {
            const permission = allPermissions[p]
            if (hasPermission(p, permissionString)) {
                permissions.push({ ...permission, hasPermission: true })
            } else {
                permissions.push({ ...permission, hasPermission: false })
            }
        }

        const moduleNames = [...new Set(permissions.map((e) => e.moduleName))]

        let moduleWisePermissions = []

        for (let i = 0; i < moduleNames.length; i++) {
            const modulePermissions = permissions.filter(
                (e) => e.moduleName === moduleNames[i]
            )
            moduleWisePermissions.push({
                moduleName: moduleNames[i],
                permissions: modulePermissions
            })
        }

        return { role: role._doc, permissionList: moduleWisePermissions }
    }

    getAppliedPermissions(data) {
        let permissions = data.map((e) => e.permissions).flat()
        let permissionData = {}

        for (let i = 0; i < permissions.length; i++) {
            if (permissions[i].hasPermission) {
                permissionData[permissions[i].permissionName] = permissions[i]
            }
        }
        return permissionData
    }

    createPermissionString(data, allPermissions) {
        let permissionString = ""
        let tempPermissionString = ""
        let appliedPermissions = this.getAppliedPermissions(data)

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

    async getAllPermissions(PERMISSION_DATA) {
        let permissions = []
        for (let p in PERMISSION_DATA) {
            const permission = PERMISSION_DATA[p]
            permissions.push({ ...permission, hasPermission: false })
        }

        const moduleNames = [...new Set(permissions.map((e) => e.moduleName))]

        let moduleWisePermissions = []

        for (let i = 0; i < moduleNames.length; i++) {
            const modulePermissions = permissions.filter(
                (e) => e.moduleName === moduleNames[i]
            )
            moduleWisePermissions.push({
                moduleName: moduleNames[i],
                permissions: modulePermissions
            })
        }

        return moduleWisePermissions
    }

    getCleanData(data) {
        for (let d in data) {
            if (data[d] === "" || data[d] == null) {
                delete data[d]
            }
        }
        return data
    }
}

module.exports = RoleService
