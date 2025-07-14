const { RoleModel, UserModel } = require("../models")
const RoleRepository = require("../repositories/role-repository")
const { RoleService } = require("../services")
const errorHandler = require("../utils/errors/app-error")
const allPermissions = require("../utils/permissionData")
const { hasPermission } = require("../utils")
const { getQueryParams } = require("../repositories/common")
const { BaseRepository } = require("../repositories")

const service = new RoleService({
    repository: new RoleRepository(),
    Model: RoleModel,
    errorHandler,
    userRepository: new BaseRepository(UserModel)
})

exports.getAllRoles = async (req, res) => {
    const data = await service.getAllRoles({ ...getQueryParams(req.query), hidden: { $ne: true } })
    return res.json(data)
}

exports.createRole = async (req, res) => {
    const data = await service.createRole(req.body, allPermissions)
    return res.json(data)
}

exports.updateRole = async (req, res) => {
    const data = await service.updateRole(
        req.params.id,
        req.body,
        allPermissions
    )
    return res.json(data)
}

exports.getRoleById = async (req, res) => {
    const data = await service.getRoleById(req.params.id, {
        allPermissions,
        hasPermission
    })
    return res.json(data)
}

exports.getAllPermissions = async (req, res) => {
    const data = await service.getAllPermissions(allPermissions)
    return res.json(data)
}


exports.deleteRole = async (req, res) => {
    const data = await service.deleteRole(req.params.id)
    return res.json(data)
}
