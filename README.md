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
    > Auction.address
    ```
3. Install the project dependencies
   ```bash
   $ npm install
   ```
4. Use the development server to deploy the application
   ```bash
   $ npm run start
   ```
