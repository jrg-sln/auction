pragma solidity >=0.4.21 <0.7.0;

contract Auction{
    // Non-mutable data
    address public owner;
    uint    public startBlock;
    uint    public endBlock;
    string  public ipfsHash;
    uint    public initialPrice;
    uint    public minimumBidIncrement;
    // Auction state
    bool    public canceled;
    address public highestBidder;
    mapping(address => uint256) fundsByBidder;
    uint    public highestBid;
    bool    ownerHasWithdrawn;

    // Constructor
    constructor(address _owner, uint _startBlock, uint _endBlock, string memory _ipfs, uint _initialPrice, uint _minBidInc) public {
        require(_startBlock < _endBlock, "El bloque final debe ser mayor que el bloque final.");
        require(_startBlock >= block.number, "El bloque inicial debe ser mayor o igual al bloque actual.");
        require(_owner != address(0), "El propietario proporcionado no es válido.");

        owner = _owner;
        startBlock = _startBlock;
        endBlock = _endBlock;
        ipfsHash = _ipfs;
        initialPrice = _initialPrice;
        minimumBidIncrement = _minBidInc;
    }

    /*function addAuction(address _owner, uint _startBlock, uint _endBlock, 
            string memory _ipfsHash, uint _initialPrice, uint _minimumBidIncrement) public {
        require(_startBlock < _endBlock, "El bloque final debe ser mayor que el bloque final.");
        require(_startBlock < block.number, "El bloque inicial debe ser mayor o igual al bloque actual.");
        require(_owner != address(0), "El propietario proporcionado no es válido.");

        auctionsCount++;
        lots[auctionsCount] = AuctionData(_owner, _startBlock, _endBlock, _ipfsHash, _initialPrice, _minimumBidIncrement, 
                                            false, address(0), 10, false);
        lots[auctionsCount].fundsByBidder[address(0)] = 0;
    }

    function placeBid(uint _auctionID, uint _bid) public {
        require(_auctionID > 0 && _auctionID <= auctionsCount, "No valid auction.");
        require(_bid > lots[_auctionID].minimumBidIncrement, "No minimum bid increment.");

        // sender already exists in fundsByBidder
        if (lots[_auctionID].fundsByBidder[msg.sender] > 0){
            if (lots[_auctionID].fundsByBidder[msg.sender]+_bid > lots[_auctionID].highestBid){
                lots[_auctionID].fundsByBidder[msg.sender] += _bid;
                lots[_auctionID].highestBid = lots[_auctionID].fundsByBidder[msg.sender];
                lots[_auctionID].highestBidder = msg.sender;
            }
        } else {
            if (_bid > lots[_auctionID].highestBid){
                lots[_auctionID].fundsByBidder[msg.sender] = _bid;
                lots[_auctionID].highestBid = _bid;
                lots[_auctionID].highestBidder = msg.sender;
            }
        }
        //emit votedEvent(_candidateId);
    }*/
}