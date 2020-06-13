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
    var web3Location = PROVIDER_ADDRESS
    const web3 = new Web3(Web3.givenProvider || web3Location)
    const accounts = await web3.eth.getAccounts()
    this.setState({ web3 })
    this.setState({ currentAccount: accounts[0] })
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