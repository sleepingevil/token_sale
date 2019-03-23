const DconToken = artifacts.require("DconToken");
const DconTokenSale = artifacts.require("DconTokenSale");

module.exports = async function(deployer) {
  await deployer.deploy(DconToken, 1000000);
  // Token price is 0.001 ETH
  await deployer.deploy(DconTokenSale, DconToken.address, 1000000000000000);
};
