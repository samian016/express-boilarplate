const mongoose = require("mongoose");
const Joi = require("joi");
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken');
const bCrypt = require('bcrypt');

const UserSchema = new Schema(
    {
        // Basic identity
        username: { type: String, required: true, unique: true },
        full_name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true },

        blocked: { type: Boolean, default: false },

        // Profile
        avatar_url: { type: String }, // URL to avatar
        bio: { type: String },
        timezone: { type: String, default: "UTC" },
        language: { type: String, default: "en" },

        // Workspace & teams
        workspaces: [
            {
                workspace_id: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace" },
                role: {
                    type: String,
                    enum: ["owner", "admin", "member", "guest"],
                    default: "member",
                },
                teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
                notifications_enabled: { type: Boolean, default: true },
                joined_at: { type: Date, default: Date.now }, // Added joined_at here
            },
        ],

        // Permissions
        is_admin: { type: Boolean, default: false },
        is_verified: { type: Boolean, default: false },
        role: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role",
            default: null, // Default to null if no role is assigned
        },
        // Preferences
        preferences: {
            dark_mode: { type: Boolean, default: false },
            sidebar_collapsed: { type: Boolean, default: false },
            default_due_time: { type: String, default: "17:00" },
            notification_settings: {
                email: { type: Boolean, default: true },
                push: { type: Boolean, default: true },
                in_app: { type: Boolean, default: true },
            },
        },

        // 2FA / Security
        two_factor_enabled: { type: Boolean, default: false },
        two_factor_secret: { type: String },

        // Integrations
        integrations: {
            github: { type: String },
            slack: { type: String },
            google: { type: String },
            notion: { type: String },
        },

        // Activity and audit
        last_login: { type: Date },
        created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        updated_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

        //FCM Tokens 
        fcm_tokens: [
            {
                token: { type: String, required: true },
                created_at: { type: Date, default: Date.now },
                _id: false,
            },
        ],
    },
    {
        timestamps: true,
        toJSON: {
            transform(doc, ret) {
                delete ret.password;
                delete ret.two_factor_secret;
                delete ret.__v;
                return ret;
            },
        },
    }
);

/* this pre method generates a hashed password for user password*/
UserSchema.pre('save', async function (next) {
    try {
        const user = this;
        if (!user.isModified('password')) return next();
        const salt = await bCrypt.genSalt(10);
        const hash = await bCrypt.hash(user.password, salt);
        user.password = hash;
        next();
    } catch (e) {
        throw new Error(e.message);
    }
});

// Generate JWT token for the user
UserSchema.methods.generateAuthToken = function () {
    const role = typeof this.role === "object" && this.role !== null
        ? { id: this.role._id.toString(), alias: this.role.alias, permissionString: this.role.permissionString }
        : { id: this.role?.toString(), name: null };
    return jwt.sign(
        {
            id: this._id,
            email: this.email,
            username: this.username,
            is_admin: this.is_admin,
            role: role // Convert ObjectId to string
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

// Check if the submitted password matches the hashed password
UserSchema.methods.checkPassword = async function (submittedPass) {
    return await bCrypt.compare(submittedPass, this.password);
};

// Joi validation schemas
UserSchema.methods.validateCreate = (data) => {
    const schema = Joi.object({
        username: Joi.string().min(3).max(30).required(),
        full_name: Joi.string().min(3).max(100).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        avatar_url: Joi.string().uri().optional(),
        bio: Joi.string().max(300).optional(),
        timezone: Joi.string().optional(),
        language: Joi.string().optional(),
        role: Joi.string().forbidden(), // Role ID or alias
    });
    return schema.validate(data, { abortEarly: false });
};


UserSchema.methods.validateCreateForAdmin = (data) => {
    const schema = Joi.object({
        username: Joi.string().min(3).max(30).required(),
        full_name: Joi.string().min(3).max(100).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        avatar_url: Joi.string().uri().optional(),
        bio: Joi.string().max(300).optional(),
        timezone: Joi.string().optional(),
        language: Joi.string().optional(),
        role: Joi.string().required(), // Role ID or alias
    });
    return schema.validate(data, { abortEarly: false });
};

UserSchema.methods.validateUpdate = (data) => {
    const schema = Joi.object({
        full_name: Joi.string().min(3).max(100).optional(),
        avatar_url: Joi.string().uri().optional(),
        bio: Joi.string().max(300).optional(),
        timezone: Joi.string().optional(),
        language: Joi.string().optional(),
        role: Joi.string().optional(), // Role ID or alias
        preferences: Joi.object({
            dark_mode: Joi.boolean(),
            sidebar_collapsed: Joi.boolean(),
            default_due_time: Joi.string(),
            notification_settings: Joi.object({
                email: Joi.boolean(),
                push: Joi.boolean(),
                in_app: Joi.boolean(),
            }),
        }).optional(),
    });
    return schema.validate(data, { abortEarly: false });
};

module.exports = mongoose.model("User", UserSchema);
