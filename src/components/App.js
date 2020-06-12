import React, { Component } from 'react';
import Web3 from 'web3';
import Main from './Main'
import { PROVIDER_ADDRESS } from '../config.js'
import './App.css';


class App extends Component {

  constructor (props){
    super(props)
    this.state = {
      web3: null,
      currentAccount: '',
      currentAccountBalance: '0',
      loading: true
    }
  }

  async componentDidMount(){
    this.loadBlockchainData()
  }

  async loadBlockchainData() {
    var web3Provider;
    if (window.ethereum) {
      web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      web3Provider = new Web3.providers.HttpProvider(PROVIDER_ADDRESS);
    }
    const web3 = new Web3(web3Provider);

    const accounts = await web3.eth.getAccounts()
    //const ethBalance = await web3.eth.getBalance(accounts[0])
    this.setState({ web3 })
    this.setState({ currentAccount: accounts[0] })
    //this.setState({ currentAccountBalance: ethBalance })
    this.setState({ loading: false })
  }

  render() {
    let content
    if(this.state.loading){
      content = <p id="loader" className="text-center">Loading...</p>
    } else {
        content = <Main web3={this.state.web3}/>
    }
    return (
      <div>
        {content}
      </div>
    );
  }
}

export default App;