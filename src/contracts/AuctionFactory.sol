pragma solidity >=0.4.21 <0.7.0;
import { Auction } from './Auction.sol';

contract AuctionFactory{
    address[] public auctions;

    event AuctionCreated(
        address auctionContract, address owner, uint numAuctions, address[] allAuctions
    );

    constructor() public {
        // NES.jpg
        createAuction(block.number, block.number+50,'QmTMmUb3Uj5ti3Whx9Pj4GMLBeFcToju28abEt578zU7hF', 500);
        // baseball_ball.jpg
        createAuction(block.number, block.number+50,'QmXhSLgF4pi3kDKu6to76VL546nizBV9JUV18sWMMFcbci', 1500);
        // bicycle.jpg
        createAuction(block.number, block.number+50,'QmQYDXLwWdSjVxB1fQtUTv28QhUnYVhmpLPY1PjL5KjDo5', 2500);
    }

    function createAuction(uint _startBlock, uint _endBlock, string memory _ipfsHash, uint _initialPrice) public {
        Auction newAuction = new Auction(msg.sender, _startBlock, _endBlock, _ipfsHash, _initialPrice);
        auctions.push(address(newAuction));
        emit AuctionCreated(address(newAuction), msg.sender, auctions.length, auctions);
    }

    function getAllAuctions() public view returns (address[] memory) {
        return auctions;
    }
}