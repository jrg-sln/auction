pragma solidity >=0.4.21 <0.7.0;

contract Auction{
    // Non-mutable data
    address public owner;
    uint    public startBlock;
    uint    public endBlock;
    uint    public startDate;
    uint    public endDate;
    string  public ipfsHash;
    uint    public initialPrice;
    // Auction state
    bool    public canceled;
    uint    public highestBid;
    address public highestBidder;
    mapping(address => uint256) fundsByBidder;
    bool    public ownerHasWithdrawn;

    event LogBid(address bidder, uint bid, address highestBidder, uint highestBid, uint highestBindingBid);
    event LogWithdrawal(address withdrawer, address withdrawalAccount, uint amount);
    event LogCanceled();

    constructor(address _owner, uint _startBlock, uint _endBlock, uint _startDate, uint _endDate,
                     string memory _ipfs, uint _initialPrice) public {
        require(_startBlock < _endBlock, "El bloque final debe ser mayor que el bloque inicial.");
        require(_startDate < _endDate, "La fecha final debe ser mayor que la inicial.");
        require(_owner != address(0), "El propietario proporcionado no es válido.");

        owner = _owner;
        startBlock = block.number + _startBlock;
        endBlock = block.number + _endBlock;
        startDate = _startDate;
        endDate = _endDate;
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
            withdrawalAccount = msg.sender;
            withdrawalAmount = fundsByBidder[withdrawalAccount];
        } else {
            if (msg.sender == owner) {
                withdrawalAccount = highestBidder;
                withdrawalAmount = highestBid;
                ownerHasWithdrawn = true;
            } else {
                require(msg.sender != highestBidder, "Tú fuiste el ganador del lote, no puedes retirar.");
                withdrawalAccount = msg.sender;
                withdrawalAmount = fundsByBidder[withdrawalAccount];
            }
        }

        require(withdrawalAmount > 0, "No hay fondos que retirar.");
        fundsByBidder[withdrawalAccount] -= withdrawalAmount;

        msg.sender.transfer(withdrawalAmount);
        emit LogWithdrawal(msg.sender, withdrawalAccount, withdrawalAmount);
        return true;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Solo el propietario del contrato puede ejecutar esta función");
        _;
    }

    modifier onlyNotOwner {
        require(msg.sender != owner, "El propietario no puede ejecutar esta función.");
        _;
    }

    modifier onlyAfterStart {
        require(block.number >= startBlock, "La subasta de este lote no ha iniciado.");
        _;
    }

    modifier onlyBeforeEnd {
        require(block.number <= endBlock, "Este lote ha terminado.");
        _;
    }

    modifier onlyNotCanceled {
        require(!canceled, "Este lote está cancelada.");
        _;
    }

    modifier onlyEndedOrCanceled {
        require(block.number > endBlock || canceled, "Esta subasta no ha sido cancelada ni ha terminado.");
        _;
    }
}