const { RoleModel } = require("../models");
const { BaseRepository } = require("../repositories");
const { UserService } = require("../services");
const errorHandler = require("../utils/errors/app-error");

const service = new UserService({
    errorHandler,
    populateWhenFindById: [],
    populateWhenGetAll: [],
    populateWhenFindOne: [],
    populateWhenProfile: [],
    sortWhenGetAll: { createdAt: -1 },
    roleRepo: new BaseRepository(RoleModel),
});

service.actions = {

}

exports.createUser_admin = async (req, res, search, fcm) => {
    const data = await service.createUser_admin(req, search, fcm);
    return res.json(data);
};

exports.loginUser = async (req, res, search, fcm) => {
    const data = await service.loginUser(req, search, fcm);
    return res.json(data);
};