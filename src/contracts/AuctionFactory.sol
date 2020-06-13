pragma solidity >=0.4.21 <0.7.0;
import { Auction } from './Auction.sol';

contract AuctionFactory{
    address[] public auctions;

    event AuctionCreated(
        address auctionContract, address owner, uint numAuctions, address[] allAuctions
    );

    function createAuction(uint _startBlock, uint _endBlock, string memory _ipfsHash, uint _initialPrice) public {
        Auction newAuction = new Auction(msg.sender, _startBlock, _endBlock, _ipfsHash, _initialPrice);
        auctions.push(address(newAuction));
        emit AuctionCreated(address(newAuction), msg.sender, auctions.length, auctions);
    }

    function getAllAuctions() public view returns (address[] memory) {
        return auctions;
    }
}