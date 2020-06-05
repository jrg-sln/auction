import React, { Component } from 'react'

class Main extends Component {
  render() {

    return (
      <div id="content">
        <h1>Auction</h1>
        <div id="content">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Item</th>
                <th scope="col">Initial price</th>
                <th scope="col">Minimum bid increment</th>
                <th scope="col">Image</th>
              </tr>
            </thead>
            <tbody id="auctionResults">

            </tbody>
          </table>
          <hr />
          <p>Balance: {window.web3.utils.fromWei(this.props.ethBalance, 'Ether')}</p>
        </div>
      </div>
    );
  }
}

export default Main;
