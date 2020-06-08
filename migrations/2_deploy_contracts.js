//const Auction = artifacts.require("Auction");
const AuctionFactory = artifacts.require("AuctionFactory");

module.exports = async function(deployer) {
//module.exports = async function(deployer, network, accounts) {
  //const userAddress = accounts[0];
  //await deployer.deploy(Auction, userAddress, 160, 200, 'NES.jpg', 500, 10);
  await deployer.deploy(AuctionFactory);
};
