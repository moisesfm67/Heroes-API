const ICrud = require("../interfaces/interfaceCrud");
const Sequelize = require("sequelize");

class Postgres extends ICrud {
    constructor(connection, schema) {
        super();

        this._connection = connection;
        this._schema = schema;
    }

    async create(item) {
        const { dataValues } = await this._schema.create(item);

        return dataValues;
    }

    async read(item = {}) {
        return await this._schema.findAll({ where: item, raw: true });
    }

    async update(id, item, upsert = false) {
        const isUpsert = upsert ? "upsert" : "update";

        return await this._schema[isUpsert](item, { where: { id } });
    }

    async delete(id) {
        const query = id ? { id } : {};

        return await this._schema.destroy({ where: query });
    }

    static async connect() {
        const SSL_DB = process.env.SSL_DB === "true" ? true : undefined;
        const SSL_DB_REJECT =
            process.env.SSL_DB_REJECT === "false" ? false : undefined;

        let dialectOptions = {};
        if (SSL_DB) {
            dialectOptions = {
                ssl: {
                    require: SSL_DB,
                    rejectUnauthorized: SSL_DB_REJECT,
                },
            };
        }

        console.log({
            env: process.env.NODE_ENV,
            JWT_SECRET: process.env.JWT_SECRET,
            PORT: process.env.PORT,
            SALT_PWD: process.env.SALT_PWD,
            MONGO_DB_URL: process.env.MONGO_DB_URL,
            POSTGRES_URL: process.env.POSTGRES_URL,
            SSL_DB_REJECT: process.env.SSL_DB_REJECT,
            SSL_DB: process.env.SSL_DB,
        });

        const connection = new Sequelize(process.env.POSTGRES_URL, {
            quoteIdentifiers: false,
            dialectOptions,
            operatorsAliases: 0,
            logging: false,
        });

        return connection;
    }

    static async defineModel(connection, schema) {
        const model = connection.define(schema.name, schema.schema, schema.options);

        await model.sync();

        return model;
    }

    async isConnected() {
        try {
            await this._connection.authenticate();

            return true;
        } catch (error) {
            return false;
        }
    }
}

module.exports = Postgres;