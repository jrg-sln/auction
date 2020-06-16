import DatePicker from 'react-datepicker';
import React from 'react';
import { Spinner } from 'react-bootstrap';
import ethlogo from '../images/eth-logo.png';

class AuctionList extends React.Component {

  constructor(props){
    super(props);

    this.state = {loading: false};

    this.setBid = this.setBid.bind(this);
    this.cancelAuction = this.cancelAuction.bind(this);
    this.withdrawBid = this.withdrawBid.bind(this);
  }

  async setBid(auction, name) {
    let initialPrice = auction.initialPrice;
    let highestBid = auction.highestBid;
    let minBid = Math.max(initialPrice, highestBid);
    let bid = document.getElementById(name).value;

    if(bid <= minBid){
        alert("La puja tiene que ser mayor a: " + minBid);
        return;
    }


    let ultimaPuja = this.props.web3.utils.toWei(this.props.currentAccountBids[auction.address], 'ether');
    let nuevaPuja = this.props.web3.utils.toWei(bid.toString(), 'ether');

    this.setState({ loading: true });
    auction.contract.methods.placeBid()
      .send({ from: this.props.currentAccount,
              value: nuevaPuja - ultimaPuja,
              gas: 6721975,
              gasPrice: 20000000000 })
            .on('receipt', recipient => {
                this.setState({loading: false})
            })
            .on('error', (error, receipt) => {
                alert("Lo sentimos, hubo un error.");
                console.log(error);
                this.setState({loading: false})
            });
  }

  async cancelAuction(auction) {
    this.setState({ loading: true });
    auction.contract.methods.cancelAuction()
    .send({ from: this.props.currentAccount,
            gas: 6721975,
            gasPrice: 20000000000 })
            .on('receipt', recipient => {
                this.setState({loading: false})
            })
            .on('error', (error, receipt) => {
                alert("Lo sentimos, hubo un error.");
                console.log(error);
                this.setState({loading: false})
            });
  }

  async withdrawBid(auction) {
    this.setState({ loading: true });
    auction.contract.methods.withdraw()
    .send({ from: this.props.currentAccount,
            gas: 6721975,
            gasPrice: 20000000000 })
            .on('receipt', recipient => {
                this.setState({loading: false});
            })
            .on('error', (error, receipt) => {
                alert("Lo sentimos, hubo un error.");
                console.log(error);
                this.setState({loading: false});
            });
  }


  render(){
    let content;

    if(this.state.loading || this.props.auctions.length === 0){
      content = <Spinner animation="border" role="status">
                  <span className="sr-only">Loading...</span>
                </Spinner>

    } else {
      content =           <table className="table">
            <thead>
              <tr>
                <th>Lote</th>
                <th>Precio inicial</th>
                <th>Inoicio</th>
                <th>Fin</th>
                <th>Puja m&aacute;s alta</th>
                <th>Su puja</th>
                <th>Estatus</th>
                <th>Actividad</th>
              </tr>
            </thead>
            <tbody id="auctionResults">
              {this.props.auctions.map(auction => {
                  let status = 'Activa'
                  if (auction.canceled) {
                      status = 'Cancelada'
                  } else {
                      if (this.props.blockNumber > auction.endBlock) {
                          status = 'Finalizada'
                      } else {
                          if (this.props.blockNumber < auction.startBlock) {
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
                          <img src={`https://ipfs.io/ipfs/${auction.ipfsHash}`}
                               className="img-thumbnail" width="50" height="50" alt="" />
                        </td>
                        <td>{auction.initialPrice} <img src={ethlogo} width="20"
                                  height="30" alt="eth logo" /></td>
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
                          {auction.highestBidder.substr(0, 6) + ": " + auction.highestBid}
                          <img src={ethlogo} width="20" height="30" alt="eth logo" />
                        </td>
                        <td>
                          {this.props.currentAccountBids[auction.address]}
                          <img src={ethlogo} width="20" height="30" alt="eth logo" />
                        </td>
                        <td>{status}</td>
                        <td>
                          {
                              auction.owner.toLowerCase() === this.props.currentAccount.toLowerCase() &&
                                  (status === 'Activa' || status === 'Por iniciar') &&
                                  <button onClick={() => this.cancelAuction(auction)}>Cancelar</button>
                          }
                          {
                              auction.owner.toLowerCase() !== this.props.currentAccount.toLowerCase() &&
                                  (status === 'Activa') &&
                                  <div>
                                    <input type="text" id={auction.address} required/>
                                    <button onClick={() => this.setBid(auction, auction.address)}>Pujar</button>
                                  </div>
                          }
                          {
                              status === 'Finalizada' &&
                              !auction.ownerHasWithdrawn  &&
                              auction.owner.toLowerCase() === this.props.currentAccount.toLowerCase() &&
                                  <button disabled={auction.highestBid === '0'}
                                          onClick={() => this.withdrawBid(auction)}>Retirar Ganancia</button>
                          }
                          {
                              status === 'Finalizada' &&
                              auction.ownerHasWithdrawn  &&
                              auction.owner.toLowerCase() === this.props.currentAccount.toLowerCase() &&
                                "Ganancia Retirada"
                          }
                          {
                              status === 'Finalizada' &&
                              auction.highestBidder.toLowerCase() !== this.props.currentAccount.toLowerCase() &&
                                  this.props.currentAccountBids[auction.address] > 0 &&
                                  <button onClick={() => this.withdrawBid(auction)}>Recuperar ether</button>
                          }
                          {
                              status === 'Cancelada' &&
                              auction.owner.toLowerCase() !== this.props.currentAccount.toLowerCase() &&
                                  this.props.currentAccountBids[auction.address] > 0 &&
                                  <button onClick={() => this.withdrawBid(auction)}>Recuperar ether</button>
                          }
                        </td>
                      </tr>
                  );
              })}
            </tbody>
          </table>
    }
      return( content  );

    }

}

export default AuctionList;
