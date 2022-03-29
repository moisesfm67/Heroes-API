const assert = require("assert");
const api = require("../api");

const Context = require("../src/db/strategies/base/contextStrategy");
const Postgres = require("../src/db/strategies/postgres");
const UserSchema = require("../src/db/strategies/postgres/schemas/userSchema");

let app = {};

const MOCK_REGISTER_HERO = {
    name: "Hulk",
    power: "Turn green",
};

const MOCK_INITIAL_HERO = {
    name: "Thor",
    power: "Lightning",
};

const USER = {
    username: "John",
    password: "Moises@123",
};

const USER_DB = {
    ...USER,
    password: "$2b$10$0y9NO4zqXityWrJHEAbobesgugW9/IJm.w4RrUOoyTDmaYuXDMCh.",
};

let MOCK_ID = "";

let headers = {};

describe("Heroes API", function() {
    this.beforeAll(async() => {
        app = await api;

        const connectionPostgres = await Postgres.connect();
        const model = await Postgres.defineModel(connectionPostgres, UserSchema);
        const context = new Context(new Postgres(connectionPostgres, model));

        await context.update(null, USER_DB, true);

        const resultLoginUser = await app.inject({
            method: "POST",
            url: "/login",
            payload: USER,
        });

        const { token } = JSON.parse(resultLoginUser.payload);

        headers = { Authorization: token };

        const resultCreateHero = await app.inject({
            method: "POST",
            url: "/heroes",
            headers,
            payload: MOCK_INITIAL_HERO,
        });

        const { _id } = JSON.parse(resultCreateHero.payload);

        MOCK_ID = _id;
    });

    it("Should list all heroes", async() => {
        const result = await app.inject({
            method: "GET",
            headers,
            url: "/heroes?skip=0&limit=10",
        });

        const statusCode = result.statusCode;
        const dados = JSON.parse(result.payload);

        assert.ok(statusCode === 200);
        assert.ok(Array.isArray(dados));
    });

    it("Should list three heroes", async() => {
        const LIMIT_SIZE = 3;
        const result = await app.inject({
            method: "GET",
            headers,
            url: `/heroes?skip=0&limit=${LIMIT_SIZE}`,
        });

        const statusCode = result.statusCode;
        const dados = JSON.parse(result.payload);

        assert.ok(statusCode === 200);
        assert.ok(dados.length <= LIMIT_SIZE);
    });

    it("Should return an error when listing heroes with an incorrect limit", async() => {
        const LIMIT_SIZE = "AEE";
        const MESSAGE_ERROR = {
            statusCode: 400,
            error: "Bad Request",
            message: '"limit" must be a number',
            validation: { source: "query", keys: ["limit"] },
        };

        const result = await app.inject({
            method: "GET",
            headers,
            url: `/heroes?skip=0&limit=${LIMIT_SIZE}`,
        });

        const statusCode = result.statusCode;
        const dados = result.payload;

        assert.ok(statusCode === MESSAGE_ERROR.statusCode);
        assert.deepEqual(dados, JSON.stringify(MESSAGE_ERROR));
    });

    it("Should return a hero by name", async() => {
        const LIMIT_SIZE = 1000;
        const HERO_NAME = MOCK_INITIAL_HERO.name;

        const result = await app.inject({
            method: "GET",
            headers,
            url: `/heroes?skip=0&limit=${LIMIT_SIZE}&name=${HERO_NAME}`,
        });

        const statusCode = result.statusCode;
        const dados = JSON.parse(result.payload);

        assert.ok(statusCode === 200);
        assert.deepEqual(dados[0].name, HERO_NAME);
    });

    it("Should register a hero", async() => {
        const result = await app.inject({
            method: "POST",
            url: "/heroes",
            headers,
            payload: MOCK_REGISTER_HERO,
        });
        const MESSAGE_SUCCESS = "Hero registered successfully!";

        const statusCode = result.statusCode;
        const { message, _id } = JSON.parse(result.payload);

        assert.ok(statusCode === 200);
        assert.notStrictEqual(_id, undefined);
        assert.deepEqual(message, MESSAGE_SUCCESS);
    });

    it("Should update a hero", async() => {
        const _id = MOCK_ID;
        const expected = {
            power: "Hammer",
        };

        const result = await app.inject({
            method: "PATCH",
            url: `/heroes/${_id}`,
            headers,
            payload: expected,
        });

        const statusCode = result.statusCode;
        const dados = JSON.parse(result.payload);

        assert.ok(statusCode === 200);
        assert.deepEqual(dados.message, "Hero successfully updated!");
    });

    it("Should return an error when trying to update a hero by passing a non-existent id", async() => {
        const _id = "6239a1328fab2b330cbde3c5";

        const expected = {
            power: "Hammer",
        };

        const result = await app.inject({
            method: "PATCH",
            url: `/heroes/${_id}`,
            headers,
            payload: expected,
        });

        const statusCode = result.statusCode;
        const dados = JSON.parse(result.payload);

        const expectedError = {
            statusCode: 412,
            error: "Precondition Failed",
            message: "Hero not found",
        };

        assert.ok(statusCode === expectedError.statusCode);
        assert.deepEqual(dados, expectedError);
    });

    it("Should remove a hero", async() => {
        const _id = MOCK_ID;

        const result = await app.inject({
            method: "DELETE",
            headers,
            url: `/heroes/${_id}`,
        });

        const statusCode = result.statusCode;
        const dados = JSON.parse(result.payload);

        assert.ok(statusCode === 200);
        assert.deepEqual(dados.message, "Hero successfully deleted!");
    });

    it("Should return an error when trying to delete a hero by passing a non-existent id", async() => {
        const _id = "6239a1328fab2b330cbde3c5";

        const result = await app.inject({
            method: "DELETE",
            headers,
            url: `/heroes/${_id}`,
        });

        const statusCode = result.statusCode;
        const dados = JSON.parse(result.payload);

        const expectedError = {
            statusCode: 412,
            error: "Precondition Failed",
            message: "Hero not found",
        };

        assert.ok(statusCode === expectedError.statusCode);
        assert.deepEqual(dados, expectedError);
    });

    it("Should return an error when trying to delete a hero by passing an invalid id", async() => {
        const _id = "INVALID_ID";

        const result = await app.inject({
            method: "DELETE",
            headers,
            url: `/heroes/${_id}`,
        });

        const statusCode = result.statusCode;
        const dados = JSON.parse(result.payload);

        const expectedError = {
            statusCode: 500,
            error: "Internal Server Error",
            message: "An internal server error occurred",
        };

        assert.ok(statusCode === expectedError.statusCode);
        assert.deepEqual(dados, expectedError);
    });
});