pragma solidity >=0.4.21 <0.7.0;

contract Auction{
    // Non-mutable data
    address public owner;
    uint    public startBlock;
    uint    public endBlock;
    string  public ipfsHash;
    uint    public initialPrice;
    // Auction state
    bool    public canceled;
    uint    public highestBid;
    address public highestBidder;
    mapping(address => uint256) fundsByBidder;
    bool    ownerHasWithdrawn;

    event LogBid(address bidder, uint bid, address highestBidder, uint highestBid, uint highestBindingBid);
    event LogWithdrawal(address withdrawer, address withdrawalAccount, uint amount);
    event LogCanceled();

    // Constructor
    constructor(address _owner, uint _startBlock, uint _endBlock, string memory _ipfs, uint _initialPrice) public {
        require(_startBlock < _endBlock, "El bloque final debe ser mayor que el bloque final.");
        require(_startBlock >= block.number, "El bloque inicial debe ser mayor o igual al bloque actual.");
        require(_owner != address(0), "El propietario proporcionado no es válido.");

        owner = _owner;
        startBlock = _startBlock;
        endBlock = _endBlock;
        ipfsHash = _ipfs;
        initialPrice = _initialPrice;
    }

    function getHighestBid() public view returns (uint) {
        return fundsByBidder[highestBidder];
    }

    function getFundsByBidder(address userAddress) public view returns (uint256){
        return fundsByBidder[userAddress];
    }

    function placeBid() public payable onlyAfterStart onlyBeforeEnd onlyNotCanceled onlyNotOwner returns (bool success) {
        require(msg.value > 0, "Payments bust be more than 0 ETH.");
        uint newBid = fundsByBidder[msg.sender] + msg.value;
        require(newBid > initialPrice, "La puja no supera el precio inicial.");
        require(newBid > highestBid, "La puja es menor a la más alta registrada.");

        fundsByBidder[msg.sender] = newBid;
        if (msg.sender != highestBidder) {
            highestBidder = msg.sender;
        }
        highestBid = newBid;

        emit LogBid(msg.sender, newBid, highestBidder, highestBid, highestBid);
        return true;
    }

    function cancelAuction() public onlyOwner onlyBeforeEnd onlyNotCanceled returns (bool success) {
        canceled = true;
        emit LogCanceled();
        return true;
    }

    function withdraw() public onlyEndedOrCanceled returns (bool success) {
        address withdrawalAccount;
        uint withdrawalAmount;

        if (canceled) {
            // if the auction was canceled, everyone should simply be allowed to withdraw their funds
            withdrawalAccount = msg.sender;
            withdrawalAmount = fundsByBidder[withdrawalAccount];
        } else {
            // the auction finished without being canceled

            if (msg.sender == owner) {
                // the auction's owner should be allowed to withdraw the highestBindingBid
                withdrawalAccount = highestBidder;
                withdrawalAmount = highestBid;
                ownerHasWithdrawn = true;
            } else {
                require(msg.sender != highestBidder, "Tú fuiste el ganador del lote, no puedes retirar.");
                // anyone who participated but did not win the auction should be allowed to withdraw
                // the full amount of their funds
                withdrawalAccount = msg.sender;
                withdrawalAmount = fundsByBidder[withdrawalAccount];
            }
        }

        //if (withdrawalAmount == 0) throw;
        require(withdrawalAmount > 0, "No hay fondos que retirar.");
        fundsByBidder[withdrawalAccount] -= withdrawalAmount;

        // send the funds
        msg.sender.transfer(withdrawalAmount);
        emit LogWithdrawal(msg.sender, withdrawalAccount, withdrawalAmount);
        return true;
    }

    modifier onlyOwner {
        //if (msg.sender != owner) throw;
        require(msg.sender == owner, "Only the owner can performe this action.");
        _;
    }

    modifier onlyNotOwner {
        //if (msg.sender == owner) throw;
        require(msg.sender != owner, "Owner cannot performe this action.");
        _;
    }

    modifier onlyAfterStart {
        //if (block.number < startBlock) throw;
        require(block.number >= startBlock, "This auction was not started yet.");
        _;
    }

    modifier onlyBeforeEnd {
        //if (block.number > endBlock) throw;
        require(block.number <= endBlock, "This auction is done.");
        _;
    }

    modifier onlyNotCanceled {
        //if (canceled) throw;
        require(!canceled, "This auction is cancel.");
        _;
    }

    modifier onlyEndedOrCanceled {
        //if (block.number < endBlock && !canceled) throw;
        require(block.number > endBlock || canceled, "This auction isnt done or cancel yet.");
        _;
    }
}