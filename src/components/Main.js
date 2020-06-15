import React, { Component } from 'react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import ipfs from './ipfs'
import { AUCTIONFACTORY_ADDRESS, AUCTION_ADDRESS } from '../config.js'
import Auction from '../abis/Auction.json'
import AuctionFactory from '../abis/AuctionFactory.json'

import logo from '../images/DAJ-logo.png';
import ethlogo from '../images/eth-logo.png';

import Navbar from './Navbar'

window.ethereum.on("accountsChanged", async function() {
  //console.log('accountsChanged');
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
      startDate: new Date(),
      endDate: new Date(),
      contractsOwner: '',
      ownersBalance: 0
    }
    this._inputStartBlock = this.state.startDate
    this._inputEndBlock = this.state.endDate
    //this.createAuction = this.createAuction.bind(this)
    this.captureFile = this.captureFile.bind(this)
    this.getAllAuctions = this.getAllAuctions.bind(this)
    this.getAuction = this.getAuction.bind(this)
    this.cancelAuction = this.cancelAuction.bind(this)
    this.getAccountBids = this.getAccountBids.bind(this)
    this.handleChange1 = this.handleChange1.bind(this);
    this.handleChange2 = this.handleChange2.bind(this);
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

    this.state.AuctionFactoryContract.methods.getBalance().call().then(ownersBalance => {
      console.log('Balance: ', ownersBalance)
      this.setState({
        ownersBalance
      })
    })

    this.state.AuctionFactoryContract.methods.owner().call().then( contractsOwner => {
      console.log('Owner: ', contractsOwner)
      this.setState({
        contractsOwner
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
    const startDate = await auction.methods.startDate().call()
    const endDate = await auction.methods.endDate().call()
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
        startDate: startDate.toString(),
        endDate: endDate.toString(),
        ipfsHash: ipfsHash.toString(),
        initialPrice: initialPrice.toString(),
        canceled: canceled,
        highestBid: this.props.web3.utils.fromWei(highestBid.toString(), 'ether').toString(),
        highestBidder: highestBidder
    }
  }

  // -------------------- EVENTS --------------------

  createAuction() {
    let now = new Date().getTime()
    let initialTime = this.state.startDate.getTime()
    let endTime = this.state.endDate.getTime()

    let dif = endTime - initialTime
    let endTimeBlock = Math.floor(dif/15000)

    if (endTimeBlock <= 0){
      alert('La fecha y hora inicial debe ser menor a la fecha final')
      return
    }

    let dif2 = initialTime - now
    let initialTimeBlock = Math.floor(dif2/15000)
    if (dif2 < 0){
      alert('La fecha y hora inicial no puede estar en el pasado.')
      return
    }

    if (this.state.buffer === null) {
      alert('Falta seleccionar una imagen.')
      return
    }

    let pay = this.props.web3.utils.toWei("0.1", 'ether')

    ipfs.files.add(this.state.buffer, (error, result) => {
      if(error){
        console.log(error)
        return
      }
      
      this.state.AuctionFactoryContract.methods.createAuction(
        initialTimeBlock,
        endTimeBlock,
        initialTime,
        endTime,
        result[0].hash,
        this._inputInitialPrice.value
      ).send({ from: this.state.currentAccount, 
                value: pay,
                gas: 4000000, 
                gasPrice: 20000000000 })
      .then(function(receipt){
        //console.log(receipt)
        //console.log(receipt.status)
        window.location.reload()
      })
    })
  }

  async setBid(auction, name) {
    let initialPrice = auction.initialPrice
    let highestBid = auction.highestBid
    let minBid = Math.max(initialPrice, highestBid)
    let bid = document.getElementById(name).value

    if(bid <= minBid){
        alert("La puja tiene que ser mayor a: " + minBid)
        return
    }

    let ultimaPuja = this.props.web3.utils.toWei(this.state.currentAccountBids[auction.address], 'ether')
    let nuevaPuja = this.props.web3.utils.toWei(bid.toString(), 'ether')
    console.log(ultimaPuja, nuevaPuja, nuevaPuja - ultimaPuja)

    auction.contract.methods.placeBid()
      .send({ from: this.state.currentAccount,
              value: nuevaPuja - ultimaPuja,
              gas: 6721975,
              gasPrice: 20000000000 })
      .then(function(receipt) {
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
      //console.log('Withdraw bid done.', receipt)
      //this.getAllAuctions()
      window.location.reload()
    })
  }

  async withdrawBalance() {
    this.state.AuctionFactoryContract.methods.withdraw()
    .send({ from: this.state.currentAccount, 
            gas: 6721975,
            gasPrice: 20000000000 })
    .then(function(receipt) {
      console.log('Withdraw balance done.', receipt)
      //window.location.reload()
    })
  }

  captureFile(event) {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () =>{
      this.setState({ buffer: Buffer(reader.result)})
    }
  }

  // Time picker
  handleChange1(date) {
    this.setState({
      startDate: date
    })
    this._inputStartBlock = date
  }
  handleChange2(date) {
    this.setState({
      endDate: date
    })
    this._inputEndBlock = date
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
                    
                    <div className="form-create-auction">
                      <h4>Crear un lote</h4>
                      <table className="table">
                        <tbody>
                          <tr>
                            <td>Precio inicial</td>
                            <td>
                              <input type="text" ref={x => this._inputInitialPrice = x} defaultValue={0} required/> 
                              <img src={ethlogo} width="20" height="30" alt="eth logo" />
                            </td>
                          </tr>
                          
                          <tr>
                            <td>Imagen</td>
                            <td><input type='file' onChange={this.captureFile}/></td>
                          </tr>
                          <tr>
                            <td>
                              Fecha de inicio<br />
                              <DatePicker
                                  selected={ this.state.startDate }
                                  onChange={ this.handleChange1 }
                                  showTimeSelect
                                  minDate={ this.state.startDate }
                                  timeFormat="HH:mm"
                                  timeIntervals={5}
                                  timeCaption="time"
                                  dateFormat="MMMM d, yyyy h:mm aa"
                                />
                            </td>
                            <td>
                              Fecha de fin<br />
                              <DatePicker
                                  selected={ this.state.endDate }
                                  onChange={ this.handleChange2 }
                                  showTimeSelect
                                  minDate={ this.state.startDate }
                                  timeFormat="HH:mm"
                                  timeIntervals={5}
                                  timeCaption="time"
                                  dateFormat="MMMM d, yyyy h:mm aa"
                                />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <button onClick={() => this.createAuction()}>Crear subasta</button><br />
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
                            <th>Actividad</th>
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
                            let initDate = new Date(Number(auction.startDate))
                            let finishDate = new Date(Number(auction.endDate))
                            return (
                              <tr key={auction.address}>
                                <td>
                                  {auction.address.substr(0, 6)}<br/>
                                  <img src={`https://ipfs.io/ipfs/${auction.ipfsHash}`} className="img-thumbnail" width="50" height="50" alt="" />
                                </td>
                                <td>{auction.initialPrice} <img src={ethlogo} width="20" height="30" alt="eth logo" /></td>
                                <td>
                                  <DatePicker
                                    selected={ initDate }
                                    dateFormat="dd/MM/yyyy h:mm aa"
                                    disabled
                                  />
                                </td>
                                <td>
                                  <DatePicker
                                    selected={ finishDate }
                                    dateFormat="dd/MM/yyyy h:mm aa"
                                    disabled
                                  />
                                </td>
                                <td>
                                  {auction.highestBidder.substr(0, 6) + ": " + auction.highestBid} <img src={ethlogo} width="20" height="30" alt="eth logo" />
                                </td>
                                <td>
                                  {this.state.currentAccountBids[auction.address]} <img src={ethlogo} width="20" height="30" alt="eth logo" />
                                </td>
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
                                      <input type="text" id={auction.address} required/>
                                      <button onClick={() => this.setBid(auction, auction.address)}>Pujar</button>
                                    </div>
                                  }
                                  {
                                    auction.owner !== this.state.currentAccount && 
                                    this.state.currentAccountBids[auction.address] > 0 &&
                                    (status === 'Cancelada' || status === 'Finalizada') &&
                                    <button onClick={() => this.withdrawBid(auction)}>Retirar</button>
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
                    {
                      this.state.contractsOwner===this.state.currentAccount &&
                      this.state.ownersBalance > 0 &&
                      <button onClick={() => this.withdrawBalance()}>Retirar</button>
                    }
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
