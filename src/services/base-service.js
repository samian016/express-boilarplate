const { BaseRepository } = require("../repositories");
const { getQueryParams } = require("../repositories/common");
const { isMongooseId } = require("../utils");

class BaseService {
    constructor({
        Model,
        errorHandler,
        modelName,
        actions,
        populateWhenGetAll,
        populateWhenFindById,
        populateWhenFindOne,
        sortWhenGetAll,
    }) {
        this.repository = new BaseRepository(Model)
        this.Model = Model
        this.errorHandler = errorHandler
        this.modelName = modelName
        this.actions = actions
        this.populateWhenGetAll = populateWhenGetAll
        this.populateWhenFindById = populateWhenFindById
        this.populateWhenFindOne = populateWhenFindOne
        this.sortWhenGetAll = sortWhenGetAll
        this.getQueryParams = getQueryParams
        this.isMongooseId = isMongooseId
    }

    async getAll(req, extra) {
        let { query } = req
        if (this.actions?.getAll) {
            query = await this.actions?.getAll(req)
        } else {
            query = this.getQueryParams(query)
        }
        return await this.repository.findAll(query, {
            populate: this.populateWhenGetAll ?? extra?.populate,
            sort: this.sortWhenGetAll ?? extra?.sort
        })
    }

    async create(req) {
        let { body } = req
        if (this.actions?.create) {
            body = await this.actions?.create(req)
        }

        body = this.getCleanData(body)
        if (this.Model().validateSchema) {
            const { error } = this.Model().validateSchema(body)
            if (error) {
                throw new this.errorHandler.ValidationError(error.message)
            }
        }

        const checkExists = await this.actions?.checkAlreadyExistsBeforeCreate
        if (checkExists) {
            const alreadyExists = await this.repository.findOne({
                [checkExists.key]: checkExists.value
            })
            if (alreadyExists) {
                throw new this.errorHandler.AlreadyExistsError(
                    `${this.modelName} with this ${checkExists.key} is already exists.`
                )
            }
        }

        return await this.repository.create(body)
    }

    async updateById(id, req) {
        let data = req.body
        if (this.actions?.update) {
            data = await this.actions.update(req)
        }

        data = this.getCleanData(data)
        if (this.Model().validateSchemaForUpdate) {
            const { error } = this.Model().validateSchemaForUpdate(data)
            if (error) {
                throw new this.errorHandler.ValidationError(error.message)
            }
        }
        if (this.convertDot) {
            data = this.transformNestedToDotNotation(data, this.translateAble);
        }
        return await this.repository.updateById(id, data)
    }

    async findById(id, req) {
        let data;
        if (this.actions?.findById) {
            data = await this.actions.findById(id, req)
        }

        data = await this.repository.findById(id, {
            populate: this.populateWhenFindById
        })

        if (!data) {
            throw new this.errorHandler.NotFoundError(
                `${this.modelName} not found by this id.`
            )
        }

        return data
    }

    async findOne(query, req) {
        let data;
        if (this.actions?.findOne) {
            data = await this.actions.findOne(req)
        }

        data = await this.repository.findOne(query, {
            populate: this.populateWhenFindOne
        })

        return data
    }

    async deleteById(id, req) {
        let data = req.body;
        if (this.actions?.deleteById) {
            data = await this.actions.deleteById(req)
        }
        data = await this.repository.deleteById(id)

        return data
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

module.exports = BaseService
