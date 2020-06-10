import React, { Component } from 'react';
import Web3 from 'web3';
import Navbar from './Navbar'
import Main from './Main'
import LoadAuction from './LoadAuction'
import './App.css';
//import logo from '../images/DAJ-logo.png';

class App extends Component {

  constructor (props){
    super(props)
    this.state = {
      web3: null,
      currentAccount: '',
      currentAccountBalance: '0',
      page: 0
    }
  }

  async componentWillMount(){
    this.loadBlockchainData()
  }

  async loadBlockchainData() {
    var web3Location = `http://127.0.0.1:7545`
    const web3 = new Web3(Web3.givenProvider || web3Location)
    const accounts = await web3.eth.getAccounts()
    const ethBalance = await web3.eth.getBalance(accounts[0])
    this.setState({ web3 })
    this.setState({ currentAccount: accounts[0] })
    this.setState({ currentAccountBalance: ethBalance })
    this.setState({ page: 1 })
  }

  render() {
    let content
    if(this.state.page === 0){
      content = <p id="loader" className="text-center">Loading...</p>
    } else {
      if(this.state.page === 1){
        content = <Main ethBalance={this.state.currentAccountBalance} web3={this.state.web3}/>
      } else {
        if(this.state.page === 2){
          content = <LoadAuction account={this.state.currentAccount}/>
        }
      }
    }
    return (
      <div>
        <Navbar account={this.state.currentAccount}/>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                
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
<img src={logo} className="App-logo" alt="logo" />
*/