const { findDataWithCount, findData } = require("./common")

class BaseRepository {
    constructor(Model) {
        this.Model = Model
    }

    async create(data) {
        const schema = this.Model(data)
        return await schema.save()
    }

    async findAll(params, { noPaginate = false, ...extra } = {}) {
        let data;
        if (noPaginate === true) {
            data = findData(this.Model, { params, populate: extra?.populate, sort: extra?.sort })
            return data;
        }

        data = findDataWithCount(this.Model, {
            params,
            populate: extra?.populate,
            sort: extra?.sort
        },)
        return data
    }

    async findById(id, extra) {
        return this.Model.findById(id).populate(extra?.populate)
    }

    async findOne(query, extra) {
        return this.Model.findOne(query).populate(extra?.populate)
    }

    async updateById(_id, data, extra) {
        return await this.Model.findByIdAndUpdate(
            _id,
            {
                $set: data
            },
            { new: true }
        ).populate(extra?.populate);
    }

    async deleteById(_id) {
        return await this.Model.findByIdAndDelete(_id)
    }

    async aggregate({ pipeline = [] }) {
        return await this.Model.aggregate(pipeline);
    }

    async countDocuments(query) {
        return await this.Model.countDocuments(query);
    }

    async deleteMany(query) {
        return await this.Model.deleteMany(query)
    }

    async updateMany(query, data) {
        return await this.Model.updateMany(query, data);
    }
}

module.exports = BaseRepository
