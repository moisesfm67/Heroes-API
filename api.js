const { config } = require("dotenv");
const { join } = require("path");
const { ok } = require("assert");

const Hapi = require("@hapi/hapi");

const HapiSwagger = require("hapi-swagger");
const Vision = require("@hapi/vision");
const Inert = require("@hapi/inert");
const HapiJWT = require("hapi-auth-jwt2");

const Context = require("./src/db/strategies/base/contextStrategy");

const MongoDb = require("./src/db/strategies/mongodb");
const HeroSchema = require("./src/db/strategies/mongodb/schemas/heroSchema");

const Postgres = require("./src/db/strategies/postgres");
const UserSchema = require("./src/db/strategies/postgres/schemas/userSchema");

const HeroRoute = require("./src/routes/heroRoutes");
const AuthRoute = require("./src/routes/authRoutes");
const UtilRoutes = require("./src/routes/utilRoutes");

const env = process.env.NODE_ENV || "dev";

ok(env === "prod" || env === "dev", "env is not defined");

const configPath = join(__dirname, `.env.${env}`);

config({
    path: configPath,
});

const app = new Hapi.Server({
    port: process.env.PORT,
});

const JWT_SECRET = process.env.JWT_SECRET;

function mapRoutes(instance, methods) {
    return methods.map((method) => instance[method]());
}

async function main() {
    const mongoDbConnection = MongoDb.connect();
    const mongoDbContext = new Context(
        new MongoDb(mongoDbConnection, HeroSchema)
    );

    const postgresDbConnection = await Postgres.connect();
    const postgresDbModel = await Postgres.defineModel(
        postgresDbConnection,
        UserSchema
    );

    const postgresDbContext = new Context(
        new Postgres(postgresDbConnection, postgresDbModel)
    );

    const swaggerOptions = {
        info: {
            title: "Heroes API - #CursoNodeBR",
            version: "v1.0",
        },
    };

    await app.register([
        HapiJWT,
        Vision,
        Inert,
        {
            plugin: HapiSwagger,
            options: swaggerOptions,
        },
    ]);

    app.auth.strategy("jwt", "jwt", {
        key: JWT_SECRET,
        validate: async(dado, request) => {
            const [result] = await postgresDbContext.read({
                username: dado.username,
            });

            if (!result) {
                return {
                    isValid: false,
                };
            }

            return {
                isValid: true,
            };
        },
    });

    app.auth.default("jwt");

    app.route([
        ...mapRoutes(new HeroRoute(mongoDbContext), HeroRoute.methods()),
        ...mapRoutes(
            new AuthRoute(JWT_SECRET, postgresDbContext),
            AuthRoute.methods()
        ),
        ...mapRoutes(new UtilRoutes(), UtilRoutes.methods()),
    ]);

    await app.start();

    console.log("Server running on port", app.info.port);

    return app;
}

module.exports = main();