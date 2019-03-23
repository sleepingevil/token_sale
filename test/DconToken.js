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
    //     const success = await instance.transfer.call(accounts[1], 1000001, { from: accounts[0] });

    //     assert.equal(success, false, 'success didn\'t equal false');
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

    it('approves tokens for delegated transfer', () => DconToken.deployed().then(async function (instance) {
        const success = await instance.approve.call(accounts[1], 100);
        assert.equal(success, true, 'it returns true');
    }));

    it('emits an Approval event upon approval', () => DconToken.deployed().then(async function (instance) {
        const receipt = await instance.approve(accounts[1], 100, { from: accounts[0] });
        assert.equal(receipt.logs.length, 1, 'triggers 1 event');
        assert.equal(receipt.logs[0].event, 'Approval', 'should emit an Approval event');
        assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the sender');
        assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs the receiver');
        assert.equal(receipt.logs[0].args._value, 100, 'logs the transfer amount');
    }));

    it('updates allowance upon approval', () => DconToken.deployed().then(async function (instance) {
        await instance.approve(accounts[1], 100, { from: accounts[0] });
        const allowance = await instance.allowance(accounts[0], accounts[1]);
        assert.equal(allowance, 100, 'sets the allowance');
    }));

    it('delegated transfer throwns when trying to send more than from balance', () => DconToken.deployed().then(async function (instance) {
        const fromAccount = accounts[2];
        const toAccount = accounts[3];
        const spendingAccount = accounts[4];

        await instance.transfer(fromAccount, 10, { from: accounts[0] });
        await instance.approve(spendingAccount, 10, { from: fromAccount });
        const error = await instance.transferFrom(fromAccount, toAccount, 200).catch(e => e);

        assert(error.message.indexOf('revert') >= 0, 'cannot transfer more than balance');
        // reset balance
        await instance.transfer(accounts[0], 10, { from: fromAccount });
    }));

    it('delegated transfer throwns when trying to send more than allowance', () => DconToken.deployed().then(async function (instance) {
        const fromAccount = accounts[2];
        const toAccount = accounts[3];
        const spendingAccount = accounts[4];

        await instance.transfer(fromAccount, 30, { from: accounts[0] });
        await instance.approve(spendingAccount, 10, { from: fromAccount });
        const error = await instance.transferFrom(fromAccount, toAccount, 20).catch(e => e);

        assert(error.message.indexOf('revert') >= 0, 'cannot transfer more than allowance');
        // reset balance
        await instance.transfer(accounts[0], 30, { from: fromAccount });
    }));

    it('return true for a successful delegated transfer', () => DconToken.deployed().then(async function (instance) {
        const fromAccount = accounts[2];
        const toAccount = accounts[3];
        const spendingAccount = accounts[4];

        await instance.transfer(fromAccount, 10, { from: accounts[0] });
        await instance.approve(spendingAccount, 10, { from: fromAccount });
        const result = await instance.transferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount }).catch(e => e);

        assert.equal(result, true, 'creturns true');
        // reset balance
        await instance.transfer(accounts[0], 10, { from: fromAccount });
    }));

    it('handle a delegated transfer', () => DconToken.deployed().then(async function (instance) {
        const fromAccount = accounts[2];
        const toAccount = accounts[3];
        const spendingAccount = accounts[4];
        await instance.transfer(fromAccount, 10, { from: accounts[0] });
        await instance.approve(spendingAccount, 10, { from: fromAccount });
        const receipt = await instance.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount }).catch(e => e);

        assert.equal(receipt.logs.length, 1, 'triggers 1 event');
        assert.equal(receipt.logs[0].event, 'Transfer', 'should emit a Transfer event');
        assert.equal(receipt.logs[0].args._from, fromAccount, 'logs the sender');
        assert.equal(receipt.logs[0].args._to, toAccount, 'logs the receiver');
        assert.equal(receipt.logs[0].args._value, 10, 'logs the transfer amount');

        const toBalance = await instance.balanceOf(toAccount);
        const fromBalance = await instance.balanceOf(fromAccount);

        assert.equal(toBalance.toNumber(), 10, 'toAccount receives the tokens');
        assert.equal(fromBalance.toNumber(), 0, 'fromAccount has the tokens deducted');

        const allowance = await instance.allowance(fromAccount, spendingAccount);

        assert.equal(allowance.toNumber(), 0, 'should deduct transfer amount from allowance');

        // reset balance
        await instance.transfer(accounts[0], 10, { from: toAccount });
    }));
})