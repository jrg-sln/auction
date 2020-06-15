pragma solidity >=0.4.21 <0.7.0;
import { Auction } from './Auction.sol';

contract AuctionFactory{
    address payable public owner;
    address[] public auctions;

    event AuctionCreated(
        address auctionContract, address owner, uint numAuctions, address[] allAuctions
    );

    event LogWithdrawal(
        address withdrawer,
        uint256 withdrawalAccount
    );

    constructor () public {
        owner = msg.sender;
    }

    function createAuction(uint _startBlock, uint _endBlock, uint _startDate, uint _endDate,
                            string memory _ipfsHash, uint _initialPrice) public payable {
        require(msg.value >= 0.01 ether, "La comisión por el uso del sistema es de 0.01.");
        Auction newAuction = new Auction(msg.sender, _startBlock, _endBlock, _startDate, _endDate, _ipfsHash, _initialPrice);
        auctions.push(address(newAuction));
        emit AuctionCreated(address(newAuction), msg.sender, auctions.length, auctions);
    }

    function getAllAuctions() public view returns (address[] memory) {
        return auctions;
    }

    function getBalance() public view returns (uint256){
        return address(this).balance;
    }

    function withdraw() public onlyOwner returns (bool success){
        uint256 balance = address(this).balance;
        owner.transfer(address(this).balance);
        emit LogWithdrawal(msg.sender, balance);
        return true;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Solo el propietario del contrato puede ejecutar esta función.");
        _;
    }
}