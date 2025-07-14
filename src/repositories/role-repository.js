const { RoleModel } = require("../models")
const { findDataWithCount } = require("./common")

//Dealing with data base operations
class RoleRepository {
    async createRole({ alias, permissionString, hidden }) {
        const role = new RoleModel({
            alias,
            permissionString,
            ...hidden && { hidden }
        })

        return await role.save()
    }

    async updateRole(_id, data) {
        return await RoleModel.findByIdAndUpdate(_id, {
            $set: data
        })
    }

    async findAllRole(params) {
        return findDataWithCount(RoleModel, { params })
    }

    async findOne(query) {
        return RoleModel.findOne(query)
    }

    async findRoleById(id) {
        return RoleModel.findById(id)
    }

    async deleteRole(id) {
        return RoleModel.findByIdAndDelete(id)
    }
}

module.exports = RoleRepository
