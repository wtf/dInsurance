var Insurance = artifacts.require('Insurance');

contract('Insurance', async (accounts) => {
    var instance;

    // Set-up hook to create useful policies before the tests run
    before(async () => {
        instance = await Insurance.deployed();
        // A policy that should expire
        await instance.create(['0x0'], 1, 2, 'https://www.google.com', 0, {value: 9999});
        // A policy that should never expire
        await instance.create(['0x0'], 1, 99999999999999999, 'https://www.google.com', 0, {value: 9999});
        // A policy that only accounts[1] should be able to release
        await instance.create(['0x0'], 1, 99999999999999999, 'https://www.google.com', 0, {from: accounts[1], value: 9999});
    });

    it("should set up policies correctly", async () => {
        let policy = await instance.policies.call(0);
        // Make sure that the owner of the new policy is set correctly
        assert.equal(policy[0], accounts[0]);
        // The balance of the policy should be 9999 (sent in msg.value above)
        assert.equal(policy[1].toNumber(), 9999);
        // All the other parameters should match the ones passed above
        assert.equal(policy[2].toNumber(), 1);
        assert.equal(policy[3].toNumber(), 2);
        assert.equal(policy[4], 'https://www.google.com');
        assert.equal(policy[5].toNumber(), 0);
    });

    it("should return number of policies", async () => {
        let result = await instance.numPolicies.call();
        assert.equal(result.toNumber(), 3);
    });

    it("should refund policies that have expired", async () => {
        // Call function to check expired policies
        await instance.checkExpired();
        // The first policy we set up should have expired and its status changed to 1
        let policy = await instance.policies.call(0);
        assert.equal(policy[5].toNumber(), 1);
    });

    it("should not refund policies that have not expired", async () => {
        // Call function to check expired policies
        await instance.checkExpired();
        // The second and third policies should still have a status of 0
        let policy = await instance.policies.call(1);
        assert.equal(policy[5].toNumber(), 0);
        policy = await instance.policies.call(2);
        assert.equal(policy[5].toNumber(), 0);
    });

    it("should only allow the owner of a policy to force its release", async () => {
        // Let's try to release a policy we don't own
        try {
            await instance.force_release(2, {from: accounts[0]});
        }
        catch(e) {}
        // And let's check if its status is still the same
        let policy = await instance.policies.call(2);
        assert.equal(policy[5].toNumber(), 0);
        // Now let's try to release a policy we actually own
        await instance.force_release(2, {from: accounts[1]});
        // And let's check if its status has indeed changed
        policy = await instance.policies.call(2);
        assert.equal(policy[5].toNumber(), 3);
    });

});
