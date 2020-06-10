import React, { Component } from 'react'
import Auction from '../abis/Auction.json'
import AuctionFactory from '../abis/AuctionFactory.json'
import ethlogo from '../images/eth-logo.png';

class Main extends Component {

  constructor (props){
    super(props)
    this.state = {
      accounts: [],
      currentAccount: '',
      auctions: [],
      auctionList: [],
      Auction: null,
      AuctionFactoryContract: null,
      AuctionContract: null,
      blockNumber: 0,
      page: 0
    }
    this.onChangeAccount = this.onChangeAccount.bind(this)
    //this.onClickCreateAuction = this.onClickCreateAuction.bind(this)
    this.getAllAuctions = this.getAllAuctions.bind(this)
    this.getAuction = this.getAuction.bind(this)
    //this.cancelAuction = this.cancelAuction.bind(this)
    this.getAccountBids = this.getAccountBids.bind(this)
    //this.onLogBid = this.onLogBid.bind(this)
  }

  async componentDidMount(){
    let afc = await new this.props.web3.eth.Contract(AuctionFactory.abi, '0x4b6a2089FeA993d871489d5faf237EC0baD2d25A')
    afc.setProvider(this.props.web3.currentProvider)
    let ac = await new this.props.web3.eth.Contract(Auction.abi, '0xf3Aae26a50cA58fAaB25BE3d85836F6aEaA47920')
    ac.setProvider(this.props.web3.currentProvider)
    this.setState({ AuctionFactoryContract: afc })
    this.setState({ AuctionContract: ac })
    const bn = await this.props.web3.eth.getBlockNumber()
    this.setState({blockNumber: bn})

    this.getAllAuctions().then(_ => {
      this.props.web3.eth.getAccounts((err, accounts) => {
        this.setState({ accounts })
      }).then(_ => {
        this.setCurrentAccount(this.state.accounts[0])
      })
    })

    /*AuctionFactory.deployed().AuctionCreated({ fromBlock: 0, toBlock: 'latest' }).watch((err, resp) => {
      console.log('AuctionCreated', err, resp)
      this.getAllAuctions()
    })*/
  }

  onChangeAccount(evt) {
    this.setCurrentAccount(evt.target.value)
  }

  setCurrentAccount(account) {
    this.props.web3.eth.defaultAccount = account

    this.getAccountBids(account).then(currentAccountBids => {
      this.setState({
        currentAccount: account,
        //currentAccountBalance: this.props.web3.utils.fromWei(this.props.web3.eth.getBalance(account), 'ether').toString(),
        currentAccountBids,
      })
    })
  }

  async getAccountBids(account) {
    console.log(account)
    const getBidPromises = this.state.auctions.map(auction => {
      //this.state.AuctionContract.methods.getFundsByBidder(account).call().then(function(res){console.log(res)})
      return this.state.AuctionContract.methods.getFundsByBidder(account).call().then(bid => {
        return { auction: auction.address, bid }
      })
    })

    return Promise.all(getBidPromises).then(results => {
      let currentAccountBids = {}
      for (let x of results) {
        currentAccountBids[x.auction] = this.props.web3.utils.fromWei(x.bid.toString(), 'ether').toString()
      }
      return currentAccountBids
    })
  }

  async getAllAuctions() {
    return new Promise((resolve, reject) => {
      return this.state.AuctionFactoryContract.methods.getAllAuctions().call().then(result => {
        return Promise.all( result.map(auctionAddr => this.getAuction(auctionAddr)) )
      }).then(auctions => {

        /*let auctionEventListeners = Object.assign({}, this.state.auctionEventListeners)
        const unloggedAuctions = auctions.filter(auction => this.state.auctionEventListeners[auction.address] === undefined)
        for (let auction of unloggedAuctions) {
          auctionEventListeners[auction.address] = auction.contract.LogBid({ fromBlock: 0, toBlock: 'latest' })
          auctionEventListeners[auction.address].watch(this.onLogBid)
        }*/

        //this.setState({ auctions, auctionEventListeners }, resolve)
        this.setState({ auctions }, resolve)
      })
    })
  }

  async getAuction(auctionAddr) {
    let auction = new this.props.web3.eth.Contract(Auction.abi, auctionAddr)

    let owner = await auction.methods.owner.call().then(function(result){
      return result
    })
    const startBlock = await auction.methods.startBlock.call().then(function(result){
      return result
    })
    const endBlock = await auction.methods.endBlock.call().then(function(result){
      return result
    })
    const ipfsHash = await auction.methods.ipfsHash.call().then(function(result){
      return result
    })
    const initialPrice = await auction.methods.initialPrice.call().then(function(result){
      return result
    })
    const minimumBidIncrement = await auction.methods.minimumBidIncrement.call().then(function(result){
      return result
    })
    const canceled = await auction.methods.canceled.call().then(function(result){
      return result
    })
    const highestBid = await auction.methods.highestBid.call().then(function(result){
      return result
    })
    const highestBidder = await auction.methods.highestBidder.call().then(function(result){
      return result
    })

    return Promise.all([owner, startBlock, endBlock, ipfsHash, initialPrice, minimumBidIncrement, canceled, highestBid, highestBidder]).then(vals => {
      const [owner, startBlock, endBlock, ipfsHash, initialPrice, minimumBidIncrement, canceled, highestBid, highestBidder] = vals
      return {
        contract: auction,
        address: auctionAddr,
        owner: owner,
        startBlock: startBlock.toString(),
        endBlock: endBlock.toString(),
        ipfsHash: ipfsHash.toString(),
        initialPrice: initialPrice.toString(),
        minimumBidIncrement: this.props.web3.utils.fromWei(minimumBidIncrement.toString(), 'ether').toString(),
        canceled: canceled,
        highestBid: this.props.web3.utils.fromWei(highestBid.toString(), 'ether').toString(),
        highestBidder: highestBidder
      }
    }).catch(err => console.log('error', err))
  }

  render() {
    return (
      <div id="content">
        <h1>Auction</h1>
        <div id="content">
        <p>Bloque actual {this.state.blockNumber}</p>
          <table className="table">
            <thead>
              <tr>
                <th>Lote</th>
                <th>Bloque inicial</th>
                <th>Bloque final</th>
                <th>Incremento m&iacute;nimo</th>
                <th>Puja m&aacute;s alta</th>
                <th>Your bid</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="auctionResults">
              {this.state.auctions.map(auction => {
                let status = 'Activa'
                if (auction.canceled) {
                  status = 'Cancelada'
                } else {
                  if (this.state.blockNumber > auction.endBlock) {
                    status = 'Finalizada'
                  } else {
                    if (this.state.blockNumber < auction.startBlock) {
                      status = 'Por iniciar'
                    }
                  }
                }
                let highestBidder='-'
                if (auction.highestBidder!=='0x0000000000000000000000000000000000000000'){
                    highestBidder = auction.highestBidder.substr(0, 6) + ": " + auction.highestBid
                }
                return (
                  <tr key={auction.address}>
                    <td>
                      {auction.address.substr(0, 6)}<br/>
                      <img src={`https://ipfs.io/ipfs/${auction.ipfsHash}`} className="img-thumbnail" width="50" height="50" alt="" />
                    </td>
                    <td>{auction.startBlock}</td>
                    <td>{auction.endBlock}</td>
                    <td>{auction.minimumBidIncrement} [Ether] 
                    <img src={ethlogo} width="20" height="30" alt="eth logo" /></td>
                    <td>
                      {highestBidder} [Ether] <img src={ethlogo} width="20" height="30" alt="eth logo" />
                    </td>
                    <td>--</td>
                    <td>{status}</td>
                    <td>
                      {auction.owner === this.state.currentAccount && (status === 'Activa' || status === 'Por iniciar') &&
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
          <p>Balance: {this.props.web3.utils.fromWei(this.props.ethBalance, 'Ether')} [Ether] <img src={ethlogo} width="20" height="30" alt="eth logo" /></p>
        </div>
      </div>
    );
  }
}

export default Main;