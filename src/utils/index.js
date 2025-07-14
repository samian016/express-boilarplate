const { mongoose } = require("mongoose");
const PERMISSION_DATA = require("./permissionData");
const jwt = require('jsonwebtoken');

const getCleanData = (data) => {
    for (let d in data) {
        if (data[d] === "" || data[d] == null) {
            delete data[d]
        }
    }

    return data
};

const isMongooseId = (id) => {
    return mongoose.isValidObjectId(id);;
};

const validateSignature = async (req) => {
    try {
        const signature = req.get("Authorization");
        const payload = await jwt.verify(signature.split(" ")[1], process.env.JWT_SECRET);
        req.user = payload;
        return true
    } catch (error) {
        return false
    }
};

const hasPermission = (operationName, permissionString) => {
    if (!permissionString) {
        return false
    }
    const permissionNumber = PERMISSION_DATA[operationName].permissionNumber
    const characterPosition = Math.floor(permissionNumber / 7)
    // if(characterPosition >= permissionString.length){
    //   return false;
    // }
    const bitPosition = permissionNumber % 7

    const ascii = permissionString.charCodeAt(characterPosition)

    let binary = ascii.toString(2)

    if (binary.length < 7) {
        binary = "0".repeat(7 - binary.length) + binary
    }
    if (binary.toString()[bitPosition] == "1") {
        return true
    }
    return false
}


exports.getCleanData = getCleanData;
exports.isMongooseId = isMongooseId;
exports.validateSignature = validateSignature;
exports.hasPermission = hasPermission;