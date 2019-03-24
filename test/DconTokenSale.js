const DconTokenSale = artifacts.require('./DconTokenSale.sol');
const DconToken = artifacts.require('./DconToken.sol');

contract('DconTokenSale', accounts => {
    const tokensAvailable = 1000000;
    const tokenPrice = 1000000000000000; // in wei
    const admin = accounts[0];

    it('initialises the contract with the correct values', () => DconTokenSale.deployed().then(async function (instance) {
        assert.notEqual(instance.address, 0x0, 'has contract address');
        assert.notEqual(await instance.tokenContract, 0x0, 'has contract tokenContractAddress');

        const price = await instance.tokenPrice();
        assert.equal(price, tokenPrice, 'token price is correct');
    }));

    it('facilitates token buying', async function() {
        const buyer = accounts[1];

        const numberOfTokens = 10;
        const value = numberOfTokens * tokenPrice;
        const tokenInstance = await DconToken.deployed();
        const instance = await DconTokenSale.deployed();

        await tokenInstance.transfer(instance.address, 10, { from: admin });

        const receipt = await instance.buyTokens(numberOfTokens, { from: buyer, value });

        assert.equal(receipt.logs[0].event, 'Sell', 'should emit a Sell event');
        assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the buyer');
        assert.equal(receipt.logs[0].args._amount, 10, 'logs the transfer amount');

        const amount = await instance.tokensSold();

        assert.equal(amount.toNumber(), numberOfTokens, 'increments the tokens sold');

        const tokenSaleBalance = await tokenInstance.balanceOf(instance.address);
        const buyerBalance = await tokenInstance.balanceOf(buyer);

        assert.equal(tokenSaleBalance.toNumber(), 0, 'deducts bought amount from sale contract');
        assert.equal(buyerBalance.toNumber(), 10, 'adds bought amount to buyer account');
    });

    it('throws if trying to buy more than ETH value', async function() {
        const buyer = accounts[2];

        const numberOfTokens = 10;
        const instance = await DconTokenSale.deployed();
        
        const error = await instance.buyTokens(numberOfTokens, { from: buyer, value: 1 }).catch(e => e);

        assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
    });

    it('throws if trying to buy more than available token amount', async function() {
        const buyer = accounts[3];
        const tokensAvailable = 75;

        const numberOfTokens = 90;
        const tokenInstance = await DconToken.deployed();
        const instance = await DconTokenSale.deployed();

        await tokenInstance.transfer(instance.address, tokensAvailable, { from: admin });

        const error = await instance.buyTokens(numberOfTokens, { from: buyer, value: numberOfTokens * tokenPrice }).catch(e => e);

        assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
    });
});