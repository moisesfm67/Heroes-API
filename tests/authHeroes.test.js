const assert = require("assert");
const api = require("../api");
const Context = require("../src/db/strategies/base/contextStrategy");
const Postgres = require("../src/db/strategies/postgres");
const UserSchema = require("../src/db/strategies/postgres/schemas/userSchema");

let app = {};

const USER = {
    username: "John",
    password: "Moises@123",
};

const USER_DB = {
    ...USER,
    password: "$2b$10$0y9NO4zqXityWrJHEAbobesgugW9/IJm.w4RrUOoyTDmaYuXDMCh.",
};

const USER_DB_INCORRECT = {
    ...USER,
    password: "$2b$10$0y9NO4zqXityWrJHEAbobesgugW9/IJm.w4RrUOoyTDmaYuXDMCh3",
};

describe("Auth test suite", function() {
    this.beforeAll(async() => {
        app = await api;
        const connectionPostgres = await Postgres.connect();
        const model = await Postgres.defineModel(connectionPostgres, UserSchema);
        const context = new Context(new Postgres(connectionPostgres, model));

        await context.update(null, USER_DB, true);
    });

    it("Should get a token", async() => {
        const result = await app.inject({
            method: "POST",
            url: "/login",
            payload: USER,
        });

        const statusCode = result.statusCode;
        const dados = JSON.parse(result.payload);

        assert.ok(statusCode === 200);

        assert.ok(dados.token.length > 10);
    });

    it("Should return unauthorized when trying to get a wrong login", async() => {
        const result = await app.inject({
            method: "POST",
            url: "/login",
            payload: USER_DB_INCORRECT,
        });

        const statusCode = result.statusCode;
        const dados = JSON.parse(result.payload);

        assert.ok(statusCode === 401);
        assert.deepEqual(dados.error, "Unauthorized");
    });
});