const Auction = artifacts.require("Auction");
const AuctionFactory = artifacts.require("AuctionFactory");

//module.exports = function(deployer) {
module.exports = async function(deployer, network, accounts) {
  const userAddress = accounts[0];
  await deployer.deploy(Auction, userAddress, 4000, 5000, 1, 40000, 'QmTMmUb3Uj5ti3Whx9Pj4GMLBeFcToju28abEt578zU7hF', 1);
  await deployer.deploy(AuctionFactory);
};
