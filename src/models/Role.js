const mongoose = require("mongoose")
const Joi = require("joi")
Joi.objectId = require("joi-objectid")(Joi)

const rolesSchema = new mongoose.Schema({
    alias: {
        type: String,
        uniq: true,
        minlength: "3",
        maxlength: "20",
        required: "Alias is required."
    },
    hidden: {
        type: Boolean,
        default: false
    },
    permissionString: {
        type: String
    },
    deleteAble: {
        type: Boolean,
        default: true
    }
})

rolesSchema.methods.validate = (role) => {
    const schema = Joi.object({
        alias: Joi.string().min(3).max(20).required(),
        permissionString: Joi.string(),
        permissionList: Joi.array().items(
            Joi.object().keys({
                moduleName: Joi.string(),
                permissions: Joi.array().items(
                    Joi.object().keys({
                        permissionName: Joi.string(),
                        hasPermission: Joi.boolean(),
                        moduleName: Joi.string(),
                        permissionNumber: Joi.number()
                    })
                )
            })
        )
    })
    return schema.validate(role, { abortEarly: false })
}

module.exports = mongoose.model("Role", rolesSchema)
