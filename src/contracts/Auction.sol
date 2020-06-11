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

        // calculate the user's total bid based on the current amount they've sent to the contract
        // plus whatever has been sent with this transaction
        uint newBid = fundsByBidder[msg.sender] + msg.value;
        require(newBid > highestBid, "Bid minor than the highest registered.");

        // grab the previous highest bid (before updating fundsByBidder, in case msg.sender is the
        // highestBidder and is just increasing their maximum bid).
        uint highestBid = fundsByBidder[highestBidder];
        /* fundsByBidder[msg.sender] = newBid;

        if (newBid <= highestBid) {
            // if the user has overbid the highestBindingBid but not the highestBid, we simply
            // increase the highestBindingBid and leave highestBidder alone.

            // note that this case is impossible if msg.sender == highestBidder because you can never
            // bid less ETH than you've already bid.

            highestBid = min(newBid + bidIncrement, highestBid);
        } else {
            // if msg.sender is already the highest bidder, they must simply be wanting to raise
            // their maximum bid, in which case we shouldn't increase the highestBindingBid.

            // if the user is NOT highestBidder, and has overbid highestBid completely, we set them
            // as the new highestBidder and recalculate highestBindingBid.

            if (msg.sender != highestBidder) {
                highestBidder = msg.sender;
                highestBid = min(newBid, highestBid + bidIncrement);
            }
            highestBid = newBid;
        } */

        emit LogBid(msg.sender, newBid, highestBidder, highestBid, highestBid);
        return true;
    }

    function min(uint a, uint b) private pure returns (uint) {
        if (a < b){
            return a;
        }
        return b;
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

            } else if (msg.sender == highestBidder) {
                // the highest bidder should only be allowed to withdraw the difference between their
                // highest bid and the highestBindingBid
                withdrawalAccount = highestBidder;
                if (ownerHasWithdrawn) {
                    withdrawalAmount = fundsByBidder[highestBidder];
                } else {
                    withdrawalAmount = fundsByBidder[highestBidder] - highestBid;
                }

            } else {
                // anyone who participated but did not win the auction should be allowed to withdraw
                // the full amount of their funds
                withdrawalAccount = msg.sender;
                withdrawalAmount = fundsByBidder[withdrawalAccount];
            }
        }

        //if (withdrawalAmount == 0) throw;
        require(withdrawalAmount == 0, "Nothing to withdraw.");

        fundsByBidder[withdrawalAccount] -= withdrawalAmount;

        // send the funds
        //if (!msg.sender.send(withdrawalAmount)) throw;
        require(msg.sender.send(withdrawalAmount), "Sender withdrawal amount failed.");

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