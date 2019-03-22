const DconToken = artifacts.require("DconToken");

module.exports = function(deployer) {
  deployer.deploy(DconToken, 1000000);
};
