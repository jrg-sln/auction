import React, { Component } from 'react';
import logo from '../logo.png';
import Web3 from 'web3';
//import Auction from '../abis/Auction.json'
import AuctionFactory from '../abis/AuctionFactory.json'
import Navbar from './Navbar'
import Main from './Main'
import './App.css';

class App extends Component {

  async componentWillMount(){
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData(){
    const web3 = window.web3

    const accounts = await web3.eth.getAccounts()
    this.setState({account: accounts[0]})
    const ethBalance = await web3.eth.getBalance(this.state.account)
    this.setState({ethBalance: ethBalance})
    
    const networkID = await web3.eth.net.getId()
    const auctionFacNet = AuctionFactory.networks[networkID]
    if (auctionFacNet){
      const auctionFac = new web3.eth.Contract(AuctionFactory.abi, auctionFacNet.address)
      this.setState({auctionFac: auctionFac})
      let lots = await auctionFac.methods.getAllAuctions().call()
      this.setState({lots: lots})
    } else {
      window.alert('Contract not deployed to detected network.')
    }

    this.setState({loading: false})
  }

  async loadWeb3(){
    if(window.ethereum){
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    } else {
      if (window.web3){
        window.web3 = new Web3(window.web3.currentProvider)
      } else {
        window.alert("Non ethereum browser detect!")
      }
    }
  }

  constructor (props){
    super(props)
    this.state = {
      account: '',
      ethBalance: '0',
      auctionFac: {},
      loading: true
    }
    //this.handleChange = this.handleChange.bind(this)
    //this.handleSubmit = this.handleSubmit.bind(this)
  }

  render() {
    let content
    if(this.state.loading){
      content = <p id="loader" className="text-center">Loading...</p>
    } else {
      content = <Main ethBalance={this.state.ethBalance}/>
    }
    return (
      <div>
        <Navbar account={this.state.account}/>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <img src={logo} className="App-logo" alt="logo" />
                {content}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;

/*
<a href="#" rel="noopener noreferrer" >
                  <img src={logo} className="App-logo" alt="logo" />
                </a>

                
*/