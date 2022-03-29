const assert = require("assert");
const PasswordHelper = require("./../src/helpers/passwordHelper");

const PASSWORD = "Moises@123";
const HASH = "$2b$10$0y9NO4zqXityWrJHEAbobesgugW9/IJm.w4RrUOoyTDmaYuXDMCh.";

describe("UserHelper test suite", function() {
    it("Should generate a hash from a password", async() => {
        const result = await PasswordHelper.hashPassword(PASSWORD);

        assert.ok(result.length > 10);
    });

    it("Should compare the password and its hash", async() => {
        const result = await PasswordHelper.comparePassword(PASSWORD, HASH);

        assert.ok(result);
    });
});