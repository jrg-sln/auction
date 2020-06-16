import React, { Component } from 'react';
import FormCreateAuction from './FormCreateAuction';
import AuctionList from './AuctionList';
import Navbar from './Navbar';

import logo from '../images/DAJ-logo.png';
import ethlogo from '../images/eth-logo.png';


class Main extends Component {

  constructor (props){
    super(props);
    this.state = {
      accounts: [],
      auctions: [],
      auctionList: [],
      Auction: null,
      auctionEventListeners: {},
      blockNumber: 0,
      currentAccountBalance: 0,
      currentAccountBids: {},
      contractsOwner: '',
      ownersBalance: 0
    };

    this.getAllAuctions = this.getAllAuctions.bind(this);
    this.getAuction = this.getAuction.bind(this);

  }

  async componentDidMount(){
    const bn = await this.props.web3.eth.getBlockNumber();
    this.setState({blockNumber: bn});


    this.getAllAuctions().then(_ => {
      this.setCurrentAccount(this.props.currentAccount);
    });


    this.props.contracts.AuctionFactory.methods.getBalance().call().then(ownersBalance => {
      this.setState({
        ownersBalance
      });
    });

    this.props.contracts.AuctionFactory.methods.owner().call().then( contractsOwner => {
      this.setState({
        contractsOwner
      });
    });

  }

  async setCurrentAccount(account) {
    this.props.web3.eth.defaultAccount = account;

    this.getAccountBids(account).then(currentAccountBids => {
      this.setState({
        currentAccountBids
      });
    });

    const ethBalance = await this.props.web3.eth.getBalance(account);
    this.setState({
      currentAccountBalance: ethBalance
    });
  };

  async getAccountBids(account) {
    const getBidPromises = this.state.auctions.map(auction => {
      let auct = new this.props.web3.eth.Contract(this.props.contracts.AuctionAbi, auction.address);
      return auct.methods.getFundsByBidder(account).call().then(bid => {
        return { auction: auction.address, bid };
      });
    });

    return Promise.all(getBidPromises).then(results => {
      let currentAccountBids = {};
      for (let x of results) {
        currentAccountBids[x.auction] = this.props.web3.utils.fromWei(x.bid.toString(), 'ether').toString();
      }
      return currentAccountBids;
    });
  }

  async getAllAuctions() {
    return new Promise((resolve, reject) => {
      return this.props.contracts.AuctionFactory.methods.getAllAuctions().call().then(result => {
        return Promise.all(result.map(auctionAddr => this.getAuction(auctionAddr)));
      }).then(auctions => {
        this.setState({ auctions }, resolve);
      });
    });
  }

  async getAuction(auctionAddr) {
    let auction = new this.props.web3.eth.Contract(this.props.contracts.AuctionAbi, auctionAddr)
    let owner = await auction.methods.owner().call()
    const startBlock = await auction.methods.startBlock().call()
    const endBlock = await auction.methods.endBlock().call()
    const startDate = await auction.methods.startDate().call()
    const endDate = await auction.methods.endDate().call()
    const ipfsHash = await auction.methods.ipfsHash().call()
    const initialPrice = await auction.methods.initialPrice().call()
    const canceled = await auction.methods.canceled().call()
    const highestBid = await auction.methods.highestBid().call()
    const highestBidder = await auction.methods.highestBidder().call()
    const ownerHasWithdrawn = await auction.methods.ownerHasWithdrawn().call()
    return {
        contract: auction,
        address: auctionAddr,
        owner: owner,
        startBlock: startBlock.toString(),
        endBlock: endBlock.toString(),
        startDate: startDate.toString(),
        endDate: endDate.toString(),
        ipfsHash: ipfsHash.toString(),
        initialPrice: initialPrice.toString(),
        canceled: canceled,
        highestBid: this.props.web3.utils.fromWei(highestBid.toString(), 'ether').toString(),
        highestBidder: highestBidder,
        ownerHasWithdrawn: ownerHasWithdrawn
    };
  }

  // -------------------- EVENTS --------------------

  async withdrawBalance() {
    this.props.contracts.AuctionFactory.methods.withdraw()
    .send({ from: this.props.currentAccount,
            gas: 6721975,
            gasPrice: 20000000000 })
    .then(function(receipt) {
      console.log('Withdraw balance done.', receipt);
      //window.location.reload()
    });
  }

  render() {


    // Escucha eventos de la blockchain
    this.props.contracts.AuctionFactory.events.AuctionCreated((err,event) => {
      this.getAllAuctions();
    });

    // this.props.contracts.AuctionFactory.events.LogWithdrawal((err,event) => {
    //     this.props.contracts.AuctionFactory.methods.getBalance().call().then(ownersBalance => {
    //         this.setState({ ownersBalance  });
    //   });
    // });

    this.state.auctions.forEach(auction => {
                                auction.contract.events.LogBid((err,event) => {
                                    this.getAllAuctions().then(_ => {
                                        this.setCurrentAccount(this.props.currentAccount);
                                    });
                                });
                                auction.contract.events.LogCanceled((err,event) => {
                                    this.getAllAuctions().then(_ => {
                                        this.setCurrentAccount(this.props.currentAccount);
                                    });
                                });
                                auction.contract.events.LogWithdrawal((err,event) => {
                                    this.getAllAuctions().then(_ => {
                                        this.setCurrentAccount(this.props.currentAccount);
                                    });
                                });

    });

    return (
      <div>
        <Navbar account={this.props.currentAccount}/>
        <div className="container mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <div id="content">
                  <img src={logo} className="App-logo" alt="logo" />
                  <div id="contentA">

                    <h4>Crear un lote </h4>
                    <FormCreateAuction
                      web3={this.props.web3}
                      AuctionFactoryContract={this.props.contracts.AuctionFactory}
                      currentAccount={this.props.currentAccount}
                    />

                  </div>
                    <br />
                    <div id="contentB">
                      <h4>Listado de lotes</h4>
                      <AuctionList
                        web3={this.props.web3}
                        auctions={this.state.auctions}
                        blockNumber={this.state.blockNumber}
                        currentAccount={this.props.currentAccount}
                        currentAccountBids={this.state.currentAccountBids}
                      />
                    </div>
                    <hr />
                    <p>
                      Balance: {this.props.web3.utils.fromWei(this.state.currentAccountBalance.toString(), 'Ether')}
                      <img src={ethlogo} width="20" height="30" alt="eth logo" />
                    </p>

                    {
                      this.state.contractsOwner.toLowerCase() === this.props.currentAccount.toLowerCase() &&
                      this.state.ownersBalance > 0 &&
                      <button onClick={() => this.withdrawBalance()}>Retirar</button>
                    }

                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default Main;
