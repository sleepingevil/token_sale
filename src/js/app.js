const App = {
    loading: false,
    web3Provider: undefined,
    contracts: {},
    tokenPrice: 1000000000000000,
    tokensSold: 0,
    tokensAvailable: 750000,
    account: '0x0',
    init: function () {
        console.log("App initialized...")
        return App.initWeb3();
    },
    initWeb3: function () {
        if (typeof web3 !== 'undefined') {
            // If a web3 instance is already provided by Meta Mask.
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
        } else {
            // Specify default instance if no web3 instance provided
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
            web3 = new Web3(App.web3Provider);
        }
        return App.initContracts();
    },
    initContracts: function () {
        $.getJSON("DconTokenSale.json", function (dconTokenSale) {
            App.contracts.DconTokenSale = TruffleContract(dconTokenSale);
            App.contracts.DconTokenSale.setProvider(App.web3Provider);
            return App.contracts.DconTokenSale.deployed()
                .then(function(dconTokenSale) { console.log("DconTokenSale address", dconTokenSale.address) });
        }).done(function () {
            const promise =  $.getJSON("DconToken.json", function (dconToken) {
                App.contracts.DconToken = TruffleContract(dconToken);
                App.contracts.DconToken.setProvider(App.web3Provider);
                return App.contracts.DconToken.deployed()
                    .then(function(dconToken) { 
                        console.log("DconToken address", dconToken.address);
                        App.render();
                    });
            });
            App.listenForEvents();
            return promise;
        });
    },
    listenForEvents: function () {
        App.contracts.DconTokenSale.deployed().then(function (instance){
            instance.Sell({}, {
                fromBlock: 0,
                toBlock: 'latest'
            }).watch(function () {
                console.log("event triggered", event);
                App.render();
            });
        });
    },
    render: function () {
        if(App.loading) {
            return;
        }
        App.loading = true;
        const loader = $("#loader");
        const content = $("#content");
        loader.show();
        content.hide();
        // Load account data
        web3.eth.getCoinbase(function(err, account) {
            if (!err) {
                App.account = account;
                $('#accountAddress').html("Your address: " + account);
            }
        });

        let dconTokenSaleInstance;
        let dconTokenInstance;
        
        App.contracts.DconTokenSale.deployed()
            .then(function (instance) {
                dconTokenSaleInstance = instance;
                return dconTokenSaleInstance.tokenPrice();
            })
            .then(function(tokenPrice) {
                App.tokenPrice = tokenPrice.toNumber();
                $('.token-price').html(web3.fromWei(App.tokenPrice, "ether"));
                return dconTokenSaleInstance.tokensSold();
            })
            .then(function (tokensSold) {
                App.tokensSold = tokensSold.toNumber();
                $('.tokens-sold').html(App.tokensSold);
                $('.tokens-available').html(App.tokensAvailable);

                let progressPercent = App.tokensSold / App.tokensAvailable * 100;

                $('#progress').css('width', progressPercent + '%');

                return App.contracts.DconToken.deployed();
            })
            .then(function (instance) {
                dconTokenInstance = instance;
                return dconTokenInstance.balanceOf(App.account);
            })
            .then(function (balance) {
                $('.dapp-balance').html(balance.toNumber());
            })
            .then(function () {
                loader.hide();
                content.show();
                App.loading = false;
            });
    },
    buyTokens: function () {
        const loader = $("#loader");
        const content = $("#content");
        loader.show();
        content.hide();
        const numberOfTokens = $('#numberOfTokens').val();

        console.log(numberOfTokens + ' | ' + App.tokenPrice);

        App.contracts.DconTokenSale.deployed().then(function (instance) {
            console.log(numberOfTokens * App.tokenPrice);
            return instance.buyTokens(numberOfTokens, { from: App.account, value: numberOfTokens * App.tokenPrice, gas: 50000 });
        }).then(function(result) {
            console.log("Tokens bought...");
            $('form')[0].reset();
        });
    }
}

$(function () {
    $(window).load(function() {
        App.init();
    });
});