pragma solidity >=0.4.21 <0.7.0;
import { Auction } from './Auction.sol';

contract AuctionFactory{
    address[] public auctions;

    event AuctionCreated(
        address auctionContract, address owner
    );

    constructor() public {
        createAuction(160, 200, 'NES.jpg', 500, 10);
        createAuction(102, 200, 'baseball_ball.jpg', 1500, 50);
        createAuction(102, 200, 'bicycle.jpg', 2500, 100);
    }

    function createAuction(uint _startBlock, uint _endBlock, string memory _ipfs, uint _initialPrice, uint _minBidInc) public {
        Auction newAuction = new Auction(msg.sender, _startBlock, _endBlock, _ipfs, _initialPrice, _minBidInc);
        auctions.push(address(newAuction));
        emit AuctionCreated(address(newAuction), msg.sender);
    }

    function getAllAuctions() public view returns (address[] memory) {
        return auctions;
    }
}