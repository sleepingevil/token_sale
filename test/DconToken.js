const DconToken = artifacts.require("./DconToken.sol");

contract('DconToken', accounts => {
    it('sets the total supply upon deployment', () => DconToken.deployed().then(async function (instance) {
        const supply = await instance.totalSupply();
        assert.equal(supply.toNumber(), 1000000, "sets totalSupply to 1000000");
    }));
})