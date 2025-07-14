const { UserModel } = require("../models");
const { UserRepository } = require("../repositories");
const { SUPER_ADMIN } = require("../utils/constants");
const BaseService = require("./base-service");

class UserService extends BaseService {
    constructor({
        errorHandler,
        populateWhenFindById,
        populateWhenGetAll,
        populateWhenFindOne,
        populateWhenProfile,
        actions,
        sortWhenGetAll = { createdAt: -1 },
        roleRepo,
    }) {
        // Validate required items with red text output
        const requiredItems = {
            errorHandler,
            populateWhenFindById,
            populateWhenGetAll,
            populateWhenFindOne,
            populateWhenProfile,
            actions,
            sortWhenGetAll,
            roleRepo,
        };

        for (const [key, value] of Object.entries(requiredItems)) {
            if (!value) {
                console.error(`\x1b[31m[UserService Init Error] Missing dependency: ${key}\x1b[0m`);
            }
        }
        super({
            Model: UserModel,
            errorHandler,
            modelName: "User",
            actions,
            populateWhenGetAll,
            populateWhenFindById,
            populateWhenFindOne,
            sortWhenGetAll,
        });
        this.repository = new UserRepository();
        this.Model = UserModel;
        this.errorHandler = errorHandler;
        this.populateWhenGetAll = populateWhenGetAll;
        this.populateWhenFindOne = populateWhenFindOne;
        this.populateWhenFindById = populateWhenFindById;
        this.populateWhenProfile = populateWhenProfile;
        this.actions = actions;
        this.sortWhenGetAll = sortWhenGetAll;
        this.roleRepo = roleRepo;
        this.modelName = "User";
    }


    async createUser_admin(req, search, fcm) {
        let { body } = req;
        const { error } = this.Model().validateCreateForAdmin(body);
        if (error) {
            throw new this.errorHandler.ValidationError(error.message);
        };
        let user = await this.repository.findOne({ email: body.email, username: body.username });
        const role = await this.roleRepo.findById(body.role);
        if (!role) {
            throw new this.errorHandler.NotFoundError("Role not found");
        }
        if (user) {
            throw new this.errorHandler.AlreadyExistsError("User with this email already exists");
        }
        user = await this.repository.createUser(body);
        if (user) search.insert('user', {
            id: user._id.toString(),
            full_name: user.full_name,
            email: user.email,
            phone: user?.phone,
        });
        return {
            message: "User created successfully",
            user: user,
        };
    };

    async loginUser(req, search, fcm) {
        const { email, password, fcm_token } = req.body;

        const user = await this.repository.findOne({ email: email }, { populate: 'role' });
        if (!user) {
            throw new this.errorHandler.AuthorizeError("Credentials are not valid");
        };
        if (user.blocked) {
            throw new this.errorHandler.ForbiddenError("Your account is blocked");
        };
        const isPasswordValid = await user.checkPassword(password);
        if (!isPasswordValid) {
            throw new this.errorHandler.AuthorizeError("Credentials are not valid");
        }
        if (user.is_admin || user.role?.alias === SUPER_ADMIN) {
            const token = user.generateAuthToken();
            return {
                message: "Login successful",
                token,
                user: user,
            }
        }
        const token = user.generateAuthToken();
        if (fcm_token) {
            const existingToken = user.fcm_tokens.find(t => t.token === fcm_token);
            if (!existingToken) {
                this.repository.updateById(user._id.toString(), { fcm_tokens: [...user.fcm_tokens, { token: fcm_token }] });
            }
        }
        return {
            message: "Login successful",
            token,
            user: user,
        };
    }
}
module.exports = UserService;