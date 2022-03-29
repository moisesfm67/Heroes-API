const Joi = require("joi");
const Boom = require("@hapi/boom");
const JWT = require("jsonwebtoken");

const BaseRoute = require("./base/baseRoute");
const PasswordHelper = require("../helpers/passwordHelper");

const failAction = (request, headers, error) => {
    throw error;
};

class AuthRoutes extends BaseRoute {
    constructor(secret, db) {
        super();

        this.secret = secret;
        this.db = db;
    }

    login() {
        return {
            path: "/login",
            method: "POST",
            options: {
                auth: false,
                tags: ["api"],
                description: "Login a user",
                notes: "login the user and returns a token",
                validate: {
                    failAction,
                    payload: Joi.object({
                        username: Joi.string().required(),
                        password: Joi.string().required(),
                    }),
                },
            },
            handler: async(request) => {
                try {
                    const { username, password } = request.payload;

                    const [user] = await this.db.read({
                        username,
                    });

                    if (!user) {
                        return Boom.unauthorized("User not found!");
                    }

                    const match = await PasswordHelper.comparePassword(
                        password,
                        user.password
                    );

                    if (!match) {
                        return Boom.unauthorized("Username or password is invalid!");
                    }

                    const token = JWT.sign({ username: username }, this.secret);

                    return { token };
                } catch (error) {
                    return Boom.internal();
                }
            },
        };
    }
}

module.exports = AuthRoutes;