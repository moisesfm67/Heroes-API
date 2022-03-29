const BaseRoute = require("./base/baseRoute");
const Joi = require("joi");
const Boom = require("@hapi/boom");

const failAction = (request, headers, error) => {
    throw error;
};

const headers = Joi.object({
    authorization: Joi.string().required(),
}).unknown();

class HeroRoutes extends BaseRoute {
    constructor(db) {
        super();

        this.db = db;
    }

    list() {
        return {
            path: "/heroes",
            method: "GET",
            options: {
                tags: ["api"],
                description: "Hero list",
                notes: "It is possible to make pagination and filter by name",
                validate: {
                    failAction,
                    headers,
                    query: Joi.object({
                        skip: Joi.number().integer().default(0),
                        limit: Joi.number().integer().default(10),
                        name: Joi.string().min(3).max(100),
                    }),
                },
            },
            handler: (request) => {
                try {
                    const { skip, limit, name } = request.query;

                    const query = name ? { name: { $regex: `.*${name}*.` } } : {};

                    const result = this.db.read({...query }, skip, limit);

                    return result;
                } catch (error) {
                    return Boom.internal();
                }
            },
        };
    }

    create() {
        return {
            path: "/heroes",
            method: "POST",
            options: {
                tags: ["api"],
                description: "Register a hero",
                notes: "Register a hero by passing name and power",
                validate: {
                    failAction,
                    headers,
                    payload: Joi.object({
                        name: Joi.string().required().min(3).max(100),
                        power: Joi.string().required().min(2).max(100),
                    }),
                },
            },
            handler: async(request) => {
                try {
                    const { name, power } = request.payload;

                    const result = await this.db.create({ name, power });

                    return {
                        message: "Hero registered successfully!",
                        _id: result._id,
                    };
                } catch (error) {
                    return Boom.internal();
                }
            },
        };
    }

    update() {
        return {
            path: "/heroes/{id}",
            method: "PATCH",
            options: {
                tags: ["api"],
                description: "Updates a specific hero's data",
                notes: "It is possible to update any hero data",
                validate: {
                    failAction,
                    headers,
                    params: Joi.object({
                        id: Joi.string().required(),
                    }),
                    payload: Joi.object({
                        name: Joi.string().min(3).max(100),
                        power: Joi.string().min(2).max(100),
                    }),
                },
            },
            handler: async(request) => {
                try {
                    const { id } = request.params;
                    const { name, power } = request.payload;

                    const result = await this.db.update({ _id: id }, { name, power });

                    if (result.modifiedCount === 0)
                        return Boom.preconditionFailed("Hero not found");

                    return {
                        message: "Hero successfully updated!",
                        _id: result._id,
                    };
                } catch (error) {
                    return Boom.internal();
                }
            },
        };
    }

    delete() {
        return {
            path: "/heroes/{id}",
            method: "DELETE",
            options: {
                tags: ["api"],
                description: "Delete a specific hero",
                validate: {
                    failAction,
                    headers,
                    params: Joi.object({
                        id: Joi.string().required(),
                    }),
                },
            },
            handler: async(request) => {
                try {
                    const { id } = request.params;

                    const result = await this.db.delete({ _id: id });

                    if (result.deletedCount === 0) {
                        return Boom.preconditionFailed("Hero not found");
                    }

                    return {
                        message: "Hero successfully deleted!",
                        _id: id,
                    };
                } catch (error) {
                    return Boom.internal();
                }
            },
        };
    }
}

module.exports = HeroRoutes;