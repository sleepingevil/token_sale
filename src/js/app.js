const App = {
    web3Provider: undefined,
    contracts: {},
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
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
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
            return $.getJSON("DconToken.json", function (dconToken) {
                App.contracts.DconToken = TruffleContract(dconToken);
                App.contracts.DconToken.setProvider(App.web3Provider);
                return App.contracts.DconToken.deployed()
                    .then(function(dconToken) { 
                        console.log("DconToken address", dconToken.address);
                        App.render();
                    });
            });
        });
    },
    render: function () {
        $("#loader").show();
        $("#content").hide();
        // Load account data
        web3.eth.getCoinbase(function(err, account) {
            if (!err) {
                App.account = account;
                $('#accountAddress').html("Your address: " + account);
                $("#loader").hide();
                $("#content").show();
            }
        });
    }
}

$(function () {
    $(window).load(function() {
        App.init();
    });
});