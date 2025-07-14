const { isValidObjectId } = require("mongoose");
const utils = require("../utils");

exports.getQueryParams = (query) => {
    if (query == null) return {}

    query = utils.getCleanData(query)
    for (let q in query) {
        if (query.hasOwnProperty(q) && q.endsWith("-range")) {
            const originalKey = q.replace("-range", "");
            const [min, max] = query[q].split("^");
            delete query[q];
            query[originalKey] = { $gte: min, ...max && { $lte: max } };
        }
        else if (query.hasOwnProperty(q) && q.startsWith("multiple-")) {
            const originalKey = q.replace("multiple-", "");
            const array = query[q].split("^");
            delete query[q];
            query[originalKey] = { $in: array };
        }
        else if (query.hasOwnProperty(q) && q.endsWith("-date")) {
            const originalKey = q.replace("-date", "");
            const [start, end] = query[q].split("^");
            delete query[q];
            query[originalKey] = { $gte: start, ...end && { $lte: end } };

        }
        else if (
            q != "invoice" &&
            (isNaN(query[q]) || q == "phone" || q == "refNo") &&
            query[q] != "true" &&
            query[q] != "false" &&
            !isValidObjectId(query[q]) &&
            typeof query[q] !== "object"
        ) {
            query[q] = { $regex: `.*${query[q]}.*`, $options: "i" }
        } else if (query[q] == "true") {
            query[q] = true
        } else if (query[q] == "false") {
            query[q] = { $ne: true }
        }
    }

    return query
}

exports.findDataWithCount = async (Model, { params, populate, sort }) => {
    const page = params?.page && params?.page > 0 ? params?.page - 1 : 0
    const size = params?.size && params?.size > 0 ? params?.size : 10

    params && delete params.page
    params && delete params.size

    const totalElements = await Model.countDocuments(params)
    const content = await Model.find(params)
        .sort(sort)
        .skip(page * size)
        .limit(size)
        .populate(populate)
    return {
        content,
        totalElements
    }
}

exports.findData = async (Model, { params, populate, sort }) => {
    params && delete params.page
    params && delete params.size

    const totalElements = await Model.countDocuments(params)
    const content = await Model.find(params)
        .sort(sort)
        .populate(populate)
    return {
        content,
        totalElements
    }
}
