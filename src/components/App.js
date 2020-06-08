import React, { Component } from 'react';
import Web3 from 'web3';
//import Auction from '../abis/Auction.json'
//import AuctionFactory from '../abis/AuctionFactory.json'
import Navbar from './Navbar'
import Main from './Main'
import LoadAuction from './LoadAuction'
import './App.css';
import logo from '../images/DAJ-logo.png';

class App extends Component {

  constructor (props){
    super(props)
    this.state = {
      web3: null,
      account: '',
      ethBalance: '0',
      auctions: [],
      auctionListItems: '',
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
    this.setState({page: 1})

    /*const auctionFactory = new web3.eth.Contract(AuctionFactory.abi, '0x805CBde0bb7A00a590deAef43602964411AB479F')
    this.setState({ auctionFactory })
    const auctions = await auctionFactory.methods.getAllAuctions().call()
    this.setState({ auctions })
    let auctionListItems = ''
    //var auctionResults = this.renderItems.current;
    for (var i = 0; i < auctions.length; i++) {
      let auction = await new web3.eth.Contract(Auction.abi, auctions[i])
      let initialPrice = await auction.methods.initialPrice().call()
      let ipfsHash = await auction.methods.ipfsHash().call()
      let minimumBidIncrement = await auction.methods.minimumBidIncrement().call()
      auctionListItems += '<tr><td>'+(i+1)+'</td><td>'+initialPrice+'</td><td>'+minimumBidIncrement+'</td><td><img width=70 height=70 src="images/' + ipfsHash + '"/></td></tr>'
      //auctionResults.append(auctionListItems);
    }
    this.setState({auctionListItems})*/
  }

  render() {
    let content
    if(this.state.page === 0){
      content = <p id="loader" className="text-center">Loading...</p>
    } else {
      if(this.state.page === 1){
        content = <Main ethBalance={this.state.ethBalance} account={this.state.account}/>
      } else {
        if(this.state.page === 2){
          content = <LoadAuction account={this.state.account}/>
        }
      }
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
