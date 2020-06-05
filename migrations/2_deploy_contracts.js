const AuctionFactory = artifacts.require("AuctionFactory");

module.exports = async function(deployer) {
  // Deploy AuctionFactory
  await deployer.deploy(AuctionFactory);
};
