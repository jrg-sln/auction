# DAJ: Decentralized Auction System

## Dependencies
* npm
* truffle
## Test
1. Set the correct variables in `truffle-config.js`
2. Deploy the contracts in the blockchain
   ```bash
   $ truffle migrate --network <blockchain>
   ```
3. Get the addresses of the deployed Contracts
    ```bash
    $ truffle console --network <blockchain>
    > AuctionFactory.address
    '0xdd...'
    > Auction.address
    '0xF8...'
    ```
4. Set the correct values of the variables in `src/config.js`
    ```javascript
    export const PROVIDER_ADDRESS = 'http://<blockchain_node_address:port>'
    export const AUCTIONFACTORY_ADDRESS = '0xdd...'
    export const AUCTION_ADDRESS = '0xF8...'
    ```
5. Install the project dependencies
   ```bash
   $ npm install
   ```
6. Use the development server to deploy the application
   ```bash
   $ npm run start
   ```
