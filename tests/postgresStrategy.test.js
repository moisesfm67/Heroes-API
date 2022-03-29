const assert = require("assert");

const Postgres = require("../src/db/strategies/postgres");
const HeroSchema = require("./../src/db/strategies/postgres/schemas/heroSchema");
const ContextStrategy = require("./../src/db/strategies/base/contextStrategy");

let context = {};

const MOCK_REGISTER_HERO = {
    name: "Hulk",
    power: "Turn green",
};

const MOCK_UPDATE_HERO = {
    name: "Thor",
    power: "Lightning",
};

describe("Postgres Strategy", function() {
    this.beforeAll(async() => {
        const connection = await Postgres.connect();
        const model = await Postgres.defineModel(connection, HeroSchema);

        context = new ContextStrategy(new Postgres(connection, model));

        await context.delete();
        await context.create(MOCK_UPDATE_HERO);
    });

    it("Should check Postgres connection", async() => {
        const result = await context.isConnected();

        assert.equal(result, true);
    });

    it("Should register a hero", async() => {
        const hero = await context.create(MOCK_REGISTER_HERO);

        delete hero.id;

        assert.deepEqual(hero, MOCK_REGISTER_HERO);
    });

    it("Should list all heroes", async() => {
        const [hero] = await context.read({ name: MOCK_REGISTER_HERO.name });

        delete hero.id;

        assert.deepEqual(hero, MOCK_REGISTER_HERO);
    });

    it("Should update a hero", async() => {
        const [hero] = await context.read({
            name: MOCK_UPDATE_HERO.name,
        });

        const newHero = {
            ...MOCK_UPDATE_HERO,
            name: "Loki",
        };

        const [isUpdated] = await context.update(hero.id, newHero);

        const [updatedHero] = await context.read({
            id: hero.id,
        });

        assert.deepEqual(isUpdated, 1);
        assert.deepEqual(updatedHero.name, newHero.name);
    });

    it("Should remove a hero", async() => {
        const [hero] = await context.read({});

        const result = await context.delete(hero.id);

        assert.deepEqual(result, 1);
    });
});