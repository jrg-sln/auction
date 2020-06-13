import React, { Component } from 'react'
import ipfs from './ipfs';
import { AUCTIONFACTORY_ADDRESS, AUCTION_ADDRESS } from '../config.js'
import Auction from '../abis/Auction.json'
import AuctionFactory from '../abis/AuctionFactory.json'

import logo from '../images/DAJ-logo.png';
import ethlogo from '../images/eth-logo.png';

import Navbar from './Navbar'

window.ethereum.on("accountsChanged", async function() {
  console.log('accountsChanged');
  //const accounts = await web3.eth.getAccounts();
  //await window.location.reload();
});

class Main extends Component {

  constructor (props){
    super(props)
    this.state = {
      accounts: [],
      auctions: [],
      auctionList: [],
      Auction: null,
      AuctionFactoryContract: null,
      AuctionContract: null,
      auctionEventListeners: {},
      blockNumber: 0,
      buffer: null,
      currentAccount: '',
      currentAccountBalance: 0,
      currentAccountBids: {},
      page: 0
    }

    //this.onChangeAccount = this.onChangeAccount.bind(this)
    this.createAuction = this.createAuction.bind(this)
    this.captureFile = this.captureFile.bind(this)
    this.getAllAuctions = this.getAllAuctions.bind(this)
    this.getAuction = this.getAuction.bind(this)
    this.cancelAuction = this.cancelAuction.bind(this)
    this.getAccountBids = this.getAccountBids.bind(this)
    this.onLogBid = this.onLogBid.bind(this)
  }

  // vars to set up a new auction
  _inputInitialPrice = null
  _inputStartBlock = null
  _inputEndBlock = null
  _inputIpfsHash = null

  async componentDidMount(){
    let afc = await new this.props.web3.eth.Contract(AuctionFactory.abi, AUCTIONFACTORY_ADDRESS)
    afc.setProvider(this.props.web3.currentProvider)
    let ac = await new this.props.web3.eth.Contract(Auction.abi, AUCTION_ADDRESS)
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
  }

  async setCurrentAccount(account) {
    this.props.web3.eth.defaultAccount = account

    this.getAccountBids(account).then(currentAccountBids => {
      this.setState({
        currentAccount: account,
        currentAccountBids
      })
    })

    const ethBalance = await this.props.web3.eth.getBalance(account)
    this.setState({
      currentAccountBalance: ethBalance
    })
  }

  async getAccountBids(account) {
    const getBidPromises = this.state.auctions.map(auction => {
      let auct = new this.props.web3.eth.Contract(Auction.abi, auction.address)
      return auct.methods.getFundsByBidder(account).call().then(bid => {
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
        return Promise.all(result.map(auctionAddr => this.getAuction(auctionAddr)))
      }).then(auctions => {
        this.setState({ auctions }, resolve)
      })
    })
  }

  async getAuction(auctionAddr) {
    let auction = new this.props.web3.eth.Contract(Auction.abi, auctionAddr)
    let owner = await auction.methods.owner().call()
    const startBlock = await auction.methods.startBlock().call()
    const endBlock = await auction.methods.endBlock().call()
    const ipfsHash = await auction.methods.ipfsHash().call()
    const initialPrice = await auction.methods.initialPrice().call()
    const canceled = await auction.methods.canceled().call()
    const highestBid = await auction.methods.highestBid().call()
    const highestBidder = await auction.methods.highestBidder().call()
    return {
        contract: auction,
        address: auctionAddr,
        owner: owner,
        startBlock: startBlock.toString(),
        endBlock: endBlock.toString(),
        ipfsHash: ipfsHash.toString(),
        initialPrice: initialPrice.toString(),
        canceled: canceled,
        highestBid: this.props.web3.utils.fromWei(highestBid.toString(), 'ether').toString(),
        highestBidder: highestBidder
    }
  }

  // -------------------- EVENTS --------------------
  /* onChangeAccount(evt) {
    console.log(evt.target.value)
    this.setCurrentAccount(evt.target.value)
  } */

  createAuction() {
    ipfs.files.add(this.state.buffer, (error, result) =>{
      if(error){
        console.log(error)
        return
      }
      this.state.AuctionFactoryContract.methods.createAuction(
        this._inputStartBlock.value,
        this._inputEndBlock.value,
        result[0].hash,
        this._inputInitialPrice.value
      ).send({ from: this.state.currentAccount, gas: 4000000, gasPrice: 20000000000 })
      .then(function(receipt){
        //console.log(receipt)
        window.location.reload()
      })
    })
  }

  async setBid(auction, name) {
    let bid = document.getElementById(name).value
    let auct = await new this.props.web3.eth.Contract(Auction.abi, auction.address)
    auct.methods.placeBid()
      .send({ from: this.state.currentAccount, 
              value: this.props.web3.utils.toWei(bid.toString(), 'ether'),
              gas: 6721975,
              gasPrice: 20000000000 })
      .then(function(receipt) {
        //console.log('Bid done.', receipt)
        //this.getAllAuctions()
        window.location.reload()
      })
  }

  async cancelAuction(auction) {
    let auct = await new this.props.web3.eth.Contract(Auction.abi, auction.address)
    auct.methods.cancelAuction()
    .send({ from: this.state.currentAccount, 
            gas: 6721975,
            gasPrice: 20000000000 })
    .then(function(receipt) {
      //console.log('Cancel done.', receipt)
      //this.getAllAuctions()
      window.location.reload()
    })
  }

  async withdrawBid(auction) {
    let auct = await new this.props.web3.eth.Contract(Auction.abi, auction.address)
    auct.methods.withdraw()
    .send({ from: this.state.currentAccount, 
            gas: 6721975,
            gasPrice: 20000000000 })
    .then(function(receipt) {
      //console.log('Cancel done.', receipt)
      //this.getAllAuctions()
      window.location.reload()
    })
  }

  onLogBid(err, resp) {
    console.log('LogBid ~>', resp.args)
    this.getAllAuctions()
    this.getAccountBids(this.state.currentAccount).then(currentAccountBids => {
      this.setState({ currentAccountBids })
    })
  }

  captureFile(event) {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () =>{
      this.setState({ buffer: Buffer(reader.result)})
      //console.log('buffer', this.state.buffer)
    }
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.currentAccount}/>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <div id="content">
                <img src={logo} className="App-logo" alt="logo" />
                  <div id="content">
                    <p>Bloque actual {this.state.blockNumber}</p>
                    <div className="form-create-auction">
                      <h4>Crear un lote</h4>
                      <table className="table">
                        <tbody>
                          <tr>
                            <td>Precio inicial</td>
                            <td><input type="text" ref={x => this._inputInitialPrice = x} defaultValue={0} /></td>
                          </tr>
                          <tr>
                            <td>Bloque inicial</td>
                            <td><input type="text" ref={x => this._inputStartBlock = x} defaultValue={ this.state.blockNumber } /></td>
                          </tr>
                          <tr>
                            <td>Bloque final</td>
                            <td><input type="text" ref={x => this._inputEndBlock = x} defaultValue={ this.state.blockNumber } /></td>
                          </tr>
                          <tr>
                            <td>Imagen</td>
                            <td><input type='file' onChange={this.captureFile} required/></td>
                          </tr>
                        </tbody>
                      </table>
                      <button onClick={this.createAuction}>Crear subasta</button><br />
                    </div>
                    <br />
                    <div id="content">
                      <h4>Listado de lotes</h4>
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Lote</th>
                            <th>Precio inicial</th>
                            <th>Bloque inicial</th>
                            <th>Bloque final</th>
                            <th>Puja m&aacute;s alta</th>
                            <th>Su puja</th>
                            <th>Estatus</th>
                            <th>Acciones</th>
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
                            return (
                              <tr key={auction.address}>
                                <td>
                                  {auction.address.substr(0, 6)}<br/>
                                  <img src={`https://ipfs.io/ipfs/${auction.ipfsHash}`} className="img-thumbnail" width="50" height="50" alt="" />
                                </td>
                                <td>{auction.initialPrice}</td>
                                <td>{auction.startBlock}</td>
                                <td>{auction.endBlock}</td>
                                <td>
                                  {auction.highestBidder.substr(0, 6) + ": " + auction.highestBid} 
                                  <img src={ethlogo} width="20" height="30" alt="eth logo" />
                                </td>
                                <td>{this.state.currentAccountBids[auction.address]} 
                                <img src={ethlogo} width="20" height="30" alt="eth logo" /></td>
                                <td>{status}</td>
                                <td>
                                  {
                                    auction.owner === this.state.currentAccount &&
                                    (status === 'Activa' || status === 'Por iniciar') &&
                                    <button onClick={() => this.cancelAuction(auction)}>Cancelar</button>
                                  }
                                  {
                                    auction.owner !== this.state.currentAccount && 
                                    (status === 'Activa') &&
                                    <div>
                                      <input type="text" id={auction.address} />
                                      <button onClick={() => this.setBid(auction, auction.address)}>Pujar</button>
                                    </div>
                                  }
                                  {
                                    auction.owner !== this.state.currentAccount && 
                                    this.state.currentAccountBids[auction.address] > 0 &&
                                    (status === 'Cancelada' || status === 'Finalizada') &&
                                    <button onClick={() => this.withdrawBid(auction)}>Cancelar</button>
                                  }
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                    <hr />
                    <p>
                      Balance: {this.props.web3.utils.fromWei(this.state.currentAccountBalance.toString(), 'Ether')} 
                      <img src={ethlogo} width="20" height="30" alt="eth logo" />
                    </p>
                  </div>
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