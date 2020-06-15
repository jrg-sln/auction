import React from 'react';
import { Row } from 'react-bootstrap';

class AuctionList extends React.Component{

  constructor(props) {
    super(props);
    this.getRowsData = this.getRowsData.bind(this);
  }

  getRowsData = function(){
    if(this.props.auctionsAddresses.length !== 0){
      return this.props.auctionsAddresses.map((row, index)=> {
          return <Row key={"r"+index}> <p> {index + " " + row} </p> </Row>;
      });
    }
  }



  render(){
    return(
        <div>
          {this.getRowsData()}
        </div>
    );
  }
}

export default AuctionList;
