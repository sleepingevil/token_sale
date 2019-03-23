const DconTokenSale = artifacts.require('./DconTokenSale.sol');

contract('DconTokenSale', accounts => {
    const tokenPrice = 1000000000000000;
    it('initialises the contract with the correct values', () => DconTokenSale.deployed().then(async function (instance) {
        assert.notEqual(instance.address, 0x0, 'has contract address');
        assert.notEqual(await instance.tokenContract, 0x0, 'has contract tokenContractAddress');

        const price = await instance.tokenPrice();
        assert.equal(price, tokenPrice, 'token price is correct');
    }));
});