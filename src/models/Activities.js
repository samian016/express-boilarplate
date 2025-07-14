const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ActivityLogSchema = new Schema(
    {
        activity: {
            type: String,
            required: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        ipAddress: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Activity", ActivityLogSchema);