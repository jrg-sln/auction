pragma solidity >=0.4.21 <0.7.0;
import { Auction } from './Auction.sol';

contract AuctionFactory{
    address[] public auctions;

    event AuctionCreated(
        address auctionContract, address owner
    );

    constructor() public {
        createAuction('NES.jpg', 500, 10);
        createAuction('baseball_ball.jpg', 1500, 50);
        createAuction('bicycle.jpg', 2500, 100);
    }

    function createAuction(string memory _ipfs, uint _initialPrice, uint _minBidInc) public {
        Auction newAuction = new Auction(msg.sender, block.number, block.number+50, _ipfs, _initialPrice, _minBidInc);
        auctions.push(address(newAuction));
        emit AuctionCreated(address(newAuction), msg.sender);
    }

    function getAllAuctions() public view returns (address[] memory) {
        return auctions;
    }
}