const assert = require("assert");
const Mongodb = require("../src/db/strategies/mongodb");
const HeroSchema = require("./../src/db/strategies/mongodb/schemas/heroSchema");
const ContextStrategy = require("./../src/db/strategies/base/contextStrategy");

let context = {};

const MOCK_REGISTER_HERO = {
    name: "Hulk",
    power: "Turn green",
};

const MOCK_DEFAULT_HERO = {
    name: `Loki-${Date.now()}`,
    power: "Magic manipulation",
};

const MOCK_UPDATE_HERO = {
    name: `Thor-${Date.now()}`,
    power: "Lightning",
};

describe("MongoDB Strategy", function() {
    this.beforeAll(async() => {
        const connection = Mongodb.connect();

        context = new ContextStrategy(new Mongodb(connection, HeroSchema));

        await context.create(MOCK_DEFAULT_HERO);
        const result = await context.create(MOCK_UPDATE_HERO);

        MOCK_UPDATE_HERO.id = result._id;
    });

    it("Should check MongoDB connection", async() => {
        const result = await context.isConnected();

        assert.equal(result, true);
    });

    it("Should register a hero", async() => {
        const { name, power } = await context.create(MOCK_REGISTER_HERO);

        assert.deepEqual({ name, power }, MOCK_REGISTER_HERO);
    });

    it("Should list the default hero", async() => {
        const [{ name, power }] = await context.read({
            name: MOCK_DEFAULT_HERO.name,
        });

        assert.deepEqual({ name, power }, MOCK_DEFAULT_HERO);
    });

    it("Should update a hero", async() => {
        const result = await context.update(MOCK_UPDATE_HERO.id, {
            power: "Hammer",
        });

        assert.deepEqual(result.modifiedCount, 1);
    });

    it("Should remove a hero", async() => {
        const result = await context.delete(MOCK_UPDATE_HERO.id);

        assert.deepEqual(result.deletedCount, 1);
    });
});