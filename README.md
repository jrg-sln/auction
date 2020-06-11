# DAJ: Decentralized Auction System

## Dependencies
    * npm
    * truffle
## Test
    1. Set the correct variables in `truffle-config.js`
    2. Deploy the contracts in the blockchain
    ```$ truffle migrate --network <blockchain>```
    3. Get the addresses of the deployed Contracts
    ```$ truffle console --network <blockchain>```
    ```> AuctionFactory.address```
    ```> Auction.address```
    3. Install the project dependencies
    ```npm install```
    4. Use the develope server to deploy the application
    ```npm run start```
