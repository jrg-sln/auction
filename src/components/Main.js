import React from 'react';
import { Container, Row, Image } from 'react-bootstrap';

import logo from '../images/DAJ-logo.png';
import Navbar from './Navbar';
import FormCreateAuction from './FormCreateAuction';
import AuctionList from './AuctionList';

class Main extends React.Component{

  constructor (props){
    super(props);
    console.log(props);
    this.state = { auctions: this.props.aAddresses };
  }

  render(){

    this.props.contracts.AuctionFactory.events.AuctionCreated((err,event) => {
        console.log(event.returnValues[0]);

        var newAuctions = this.state.auctions.slice();
        console.log(newAuctions);
        newAuctions.push(event.returnValues[0]);
        this.setState({auctions: newAuctions});
    });

    return(
      <div>
        <Navbar account={this.props.currentAccount}/>
        <Container className="mt-5 p-3">
          <Row className="justify-content-center">
              <Image src={logo} />
          </Row>

          <Row className="justify-content-center">
              <h2>
                Crea un Lote
              </h2>
          </Row>

          <Row className="justify-content-center mt-6">
              <FormCreateAuction
                AuctionFactoryContract={this.props.contracts.AuctionFactory}
                currentAccount={this.props.currentAccount}
              />
          </Row>
          <AuctionList
            auctionsAddresses={this.state.auctions}/>
        </Container>
      </div>
    );
  }

}

export default Main;
