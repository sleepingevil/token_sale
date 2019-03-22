const DconToken = artifacts.require("./DconToken.sol");

contract('DconToken', accounts => {
    
    it('initialises the contract with the correct values', () => DconToken.deployed().then(async function (instance) {
        const name = await instance.name();
        const symbol = await instance.symbol();
        const standard = await instance.standard();
        assert.equal(name, 'DconToken');
        assert.equal(symbol, 'DCON');
        assert.equal(standard, 'Dcon Token v1.0')
    }));
    
    it('allocates the total supply upon deployment', () => DconToken.deployed().then(async function (instance) {
        const supply = await instance.totalSupply();
        assert.equal(supply.toNumber(), 1000000, "sets totalSupply to 1000000");
        const balance = await instance.balanceOf(accounts[0]);
        assert.equal(balance.toNumber(), 1000000, 'allocates all supply to admin');
    }));

    it('doesn\'t transfer token ownership if _from has insufficient balance', () => DconToken.deployed().then(async function (instance) {
        const error = await instance.transfer(accounts[1], 99999999).catch(e => e);
        assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
    }));

    it('returns true for a successful transfer', () => DconToken.deployed().then(async function (instance) {
        const success = await instance.transfer.call(accounts[1], 1);

        assert.equal(success, true, 'success didn\'t equal true');
    }));

    // TODO: Figure out how to test for throws in javascript. Potentiall move the tests to solidtity
    //
    // it('returns false for an unsuccessful transfer', () => DconToken.deployed().then(async function (instance) {
    //     const success = await instance.transfer.call(accounts[1], 99999999).catch((e,d) => {
    //         console.log(e);
    //         console.log(d);
    //         return d;
    //     });

    //     assert.equal(success, true, 'success didn\'t equal false');
    // }));

    it('transfers token ownership if _from has sufficient balance', () => DconToken.deployed().then(async function (instance) {
        const receipt = await instance.transfer(accounts[1], 250000, { from: accounts[0] });
        assert.equal(receipt.logs.length, 1, 'triggers 1 event');
        assert.equal(receipt.logs[0].event, 'Transfer', 'should emit a Transfer event');
        assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the sender');
        assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the receiver');
        assert.equal(receipt.logs[0].args._value, 250000, 'logs the transfer amount');
        const newBalanceOnToAccount = await instance.balanceOf(accounts[1]);
        assert.equal(newBalanceOnToAccount.toNumber(), 250000, 'adds the account to the receiving account');
        const newBalanceOnFromAccount = await instance.balanceOf(accounts[0]);
        assert.equal(newBalanceOnFromAccount, 750000, 'deducts the amount from the sender account');
    }));
})