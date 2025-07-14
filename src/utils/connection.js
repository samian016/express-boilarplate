const mongoose = require("mongoose");
const { DB_URL } = require("../config");
const { initialStart } = require("./initial-database");
console.log("DB_URL", DB_URL);
try {
    mongoose
        .connect(DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(async () => {
            console.log("Db Connected");
            await initialStart();
        })
        .catch((err) => {
            console.log(" Mongodb connection error", err);
        });
} catch (error) {
    console.error("Error ============ ON DB Connection");
    console.log(error);
}

module.exports = mongoose;
