import React from 'react';
import { SpinnerFP } from './utils.js';
import Web3 from 'web3';
import Main from './Main';
import { PROVIDER_ADDRESS, AUCTIONFACTORY_ADDRESS } from '../config.js';
import Auction from '../abis/Auction.json';
import AuctionFactory from '../abis/AuctionFactory.json';


class App extends React.Component {

  constructor (props){
    super(props);
    this.state = {
      web3: null,
      loading: true
    };
  }

  componentDidMount(){
    this.loadBlockchainData();
  }

  async loadBlockchainData() {
    var web3Provider;
    if (window.ethereum) {
      web3Provider = window.ethereum;
      try {
        //Request account access
        await window.ethereum.enable();
      } catch (error) {
        //User denied account access...
        console.error("User denied account access");
      }
    }
    //Legacy dapp browsers...
    else if (window.web3) {
      web3Provider = window.web3.currentProvider;
    }
    //If no injected web3 instance is detected, fall back to Ganache
    else {
      web3Provider = new Web3.providers.HttpProvider(PROVIDER_ADDRESS);
    }

    const web3 = new Web3(web3Provider);
    let afc = await new web3.eth.Contract(AuctionFactory.abi, AUCTIONFACTORY_ADDRESS);
    await afc.setProvider(web3.currentProvider);
    let aAddresses = await afc.methods.getAllAuctions().call();

    window.ethereum.on("accountsChanged",  accounts => {
        window.location.reload();
    });
    this.setState({ web3: web3,
                    contracts: {AuctionFactory: afc,
                                AuctionAbi: Auction.abi},
                    currentAccount: web3.currentProvider.selectedAddress,
                    loading: false,
                    aAddresses: aAddresses
                  });
  }


  render() {
    let content;

    if(this.state.loading){
      content = <SpinnerFP/>;
    } else {
      content = <Main
                  web3={this.state.web3}
                  contracts={this.state.contracts}
                  currentAccount={this.state.currentAccount}
                />;
    }
    return (
        content
    );
  }
}

export default App;
