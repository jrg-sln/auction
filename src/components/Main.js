import React, { Component } from 'react'
import Web3 from 'web3';
import Auction from '../abis/Auction.json'
import AuctionFactory from '../abis/AuctionFactory.json'

class Main extends Component {

  constructor (props){
    super(props)
    this.state = {
      web3: null,
      account: '',
      ethBalance: '0',
      auctions: [],
      auctionList: [],
      page: 0
    }
    this.renderItems = React.createRef();
  }

  async componentWillMount(){
    this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = new Web3(Web3.givenProvider || "http://localhost:7545")
    this.setState({web3})
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const ethBalance = await web3.eth.getBalance(this.state.account)
    this.setState({ethBalance: ethBalance})
    this.setState({page: 2})

    const auctionFactory = new web3.eth.Contract(AuctionFactory.abi, '0x805CBde0bb7A00a590deAef43602964411AB479F')
    this.setState({ auctionFactory })
    const auctions = await auctionFactory.methods.getAllAuctions().call()
    this.setState({ auctions })
    //var auctionResults = this.renderItems.current;
    /*for (var i = 0; i < auctions.length; i++) {
      newFile = this.state.files.map((file) => {
        return {getAuction(auctions[i])};
      });
    
      let auction = await new web3.eth.Contract(Auction.abi, auctions[i])
      let initialPrice = await auction.methods.initialPrice().call()
      let ipfsHash = await auction.methods.ipfsHash().call()
      let minimumBidIncrement = await auction.methods.minimumBidIncrement().call()
      auctionListItems += '<tr><td>'+(i+1)+'</td><td>'+initialPrice+'</td><td>'+minimumBidIncrement+'</td><td><img width=70 height=70 src="images/' + ipfsHash + '"/></td></tr>'
      auctionResults.append(auctionListItems);
    }*/
    //this.setState({auctionListItems})
    let auctionList = await auctions.map(auctionAddr => this.getAuction(auctionAddr))
    this.setState({ auctionList })
  }

  async getAuction(auctionAddr) {
    const auction = await new this.state.web3.eth.Contract(Auction.abi, auctionAddr)
    const owner = auction.methods.owner.call()
    const startBlock = auction.methods.startBlock.call()
    const endBlock = auction.methods.endBlock.call()
    const ipfsHash = auction.methods.ipfsHash.call()
    //const minimumBidIncrement = auction.methods.minimumBidIncrement.call()
    //const highestBid = auction.methods.highestBid.call()
    //const highestBindingBid = auction.methods.highestBindingBid.call()
    const highestBidder = auction.methods.highestBidder.call()
    const canceled = auction.methods.canceled.call()

    return Promise.allSettled([ owner, startBlock, endBlock, ipfsHash, highestBidder, canceled ]).then(vals => {
      const [ owner, startBlock, endBlock, ipfsHash, highestBidder, canceled ] = vals
      return {
        contract: auction,
        address: auctionAddr,
        owner: owner,
        startBlock: startBlock.toString(),
        endBlock: endBlock.toString(),
        ipfsHash: ipfsHash.toString(),
        //minimumBidIncrement: this.state.web3.utils.fromWei(minimumBidIncrement.toString(), 'ether').toString(),
        //highestBid: this.state.web3.utils.fromWei(highestBid.toString(), 'ether').toString(),
        highestBidder: highestBidder,
        canceled: canceled,
      }
    }).catch(err => console.log('error', err))
  }

  render() {
    return (
      <div id="content">
        <h1>Auction</h1>
        <div id="content">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Address</th>
                <th scope="col">Initial block</th>
                <th scope="col">End block</th>
                <th scope="col">Minimum bid increment</th>
                <th scope="col">Image</th>
              </tr>
            </thead>
            <tbody id="auctionResults">
              {this.state.auctionList.map(auction => {
                let status = 'Running'
                return (
                  <tr key={auction.address}>
                    <td>{auction.address}</td>
                    <td>{auction.startBlock}</td>
                    <td>{auction.endBlock}</td>
                    <td>{auction.highestBidder}</td>
                    <td>
                      {auction.owner === this.props.account && (status === 'Running' || status === 'Unstarted') &&
                        <button onClick={() => this.cancelAuction(auction)}>Cancel</button>
                      }
                      <div>
                        <input ref={x => this._inputBidAmount = x} />
                        <button onClick={() => this.onClickBid(auction)}>Bid</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <hr />
          <p>Balance: {this.state.web3.utils.fromWei(this.state.ethBalance, 'Ether')}</p>
        </div>
      </div>
    );
  }
}

export default Main;

/*
              {this.state.auctionList.map(auction => {
                let status = 'Running'
                if (auction.canceled) {
                  status = 'Canceled'
                } else if (this.props.web3.eth.blockNumber > auction.endBlock) {
                  status = 'Ended'
                } else if (this.props.web3.eth.blockNumber < auction.startBlock) {
                  status = 'Unstarted'
                }
                return (
                  <tr key={auction.address}>
                    <td>{auction.address.substr(0, 6)}</td>
                    <td>{auction.startBlock}</td>
                    <td>{auction.endBlock}</td>
                    <td>{auction.bidIncrement} ETH</td>
                    <td>{auction.highestBid} ETH</td>
                    <td>{auction.highestBindingBid} ETH</td>
                    <td>{auction.highestBidder.substr(0, 6)}</td>
                    <td>{this.state.currentAccountBids[auction.address]}</td>
                    <td>{status}</td>
                    <td>
                      {auction.owner == this.state.currentAccount && (status === 'Running' || status === 'Unstarted') &&
                        <button onClick={() => this.cancelAuction(auction)}>Cancel</button>
                      }
                      <div>
                        <input ref={x => this._inputBidAmount = x} />
                        <button onClick={() => this.onClickBid(auction)}>Bid</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
*/