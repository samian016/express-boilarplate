const BaseRepository = require("./base-repository");
const { UserModel } = require("../models")
class UserRepository extends BaseRepository {
    constructor() {
        super(UserModel);
    }
    async createUser(data) {
        const user = new UserModel(data)

        const userResult = await user.save()
        return userResult
    }
    // Additional methods for UserRepository can be added here
};

module.exports = UserRepository;