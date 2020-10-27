# Initial token sale flow

[Example of a successful testnet sale on Kovan](https://kovan.etherscan.io/address/0x506E1db7DA1B3876eAcd2EdDf6ED551A7F2787D0).

_(Note: gas amounts are calculated for May 2017 and parameters chosen for ANTv1)_

### Instantiation

#### 1. Deploy sale – 1,425,663 gas
`AragonTokenSale` will be deployed 1 week prior to the beginning of the sale with the following parameters:

- Initial block: TBC
- Final block: Initial block + 172,800 (4 weeks)
- Aragon Dev Multisig: TBC (2/3 confirms multisig with Jorge, Luis, Security key that can only be reconstructed by Jorge and Luis).
- Community Multisig: TBC (3/5 confirms with Aragon Dev Multisig + 4 trusted members of community)
- Initial price: 100
- Final price: 66
- Price stages: 2
- Cap commitment: sealed commitment for the soft hidden cap.

#### 2. `sale.setANT()` – 95,427 gas
`setANT()` needs to called from the Aragon Multisig. Its parameters are:

- ANT: An empty deployed instance of ANTv1.
- ANPlaceholder: An Aragon Network placeholder contract with references to the `AragonTokenSale` and `ANT`.
- Sale wallet: A contract that holds sale funds until final block.

Aragon Dev will perform `setANT()` immediately after deploying the sale so it is instantiated as soon as possible.

After `deployANT()` has been called, the sale contract will have two public addresses available:

- token: The address of the official MiniMe ERC20-compatible ANTv1 token.
- networkPlaceholder: The placeholder for the Aragon Network until its eventual deployment.

The sale will be the token controller during the sale. After the sale it will be the `networkPlaceholder`.

Aragon Dev will at this point prove the source code of the contracts in blockchain explorers.

### Presale

The presale is the period between full sale instantiation to the initialBlock of the sale.

During the presale it is required that the sale is activated, failing to activate the sale during this period, will cause the sale to never start.

#### 3. `sale.allocatePresaleTokens()` – 209,075 gas

Aragon Dev will be able to allocate at its own discretion as many presale tokens as needed before the sale is activated.

Aragon Dev will only issue presale token to presale partners that took part in a private sale done for gathering the funds needed for the sale.

Presale tokens have cliff and vesting for avoiding market dumps.

#### 4. `sale.activateSale()` – 2 * 42,862 gas

Both Aragon Dev and the Community Multisig must call `activateSale()` in order to consider the sale activated.

When both multisigs have called this function, the sale will be activated and no more presale allocations will be allowed.

### Sale

If the presale is successful in activating the sale, the sale will start on the initial block.

#### 5. Buy tokens: `sale.fallback()` || `token.fallback()` – 108,242 gas || 118,912 gas

After the sale is started, sending an ether amount greater than the dust value (1 finney) will result in tokens getting minted and assigned to the sender of the payment.

All the funds collected will be instantly sent to the Aragon Dev multisig for security.

Disclaimer: Please do not send directly from exchanges.

<img src="./assets/ant_buy.png"/>

#### 6. `sale.revealCap()`

During the sale, Aragon can reveal the hidden cap and cap secret resulting in the hard cap of the contract being modified by this new cap.

In case the cap is revealed and the sale contract has already raised an amount higher than the cap, the sale is automatically finalized.

#### 7. `sale.emergencyStopSale()` – 43,864 gas

After the sale is activated, Aragon Dev will be able to stop the sale for an emergency.

#### 8. `sale.restartSale()` – 14,031 gas

After the sale has been stopped for an emergency and the sale is still ongoing, Aragon Dev will be able to restart it.

After the sale has ended, it cannot be restarted. The sale can end in a stopped state without problem, but if enabled to restart after ending it could allow Aragon Dev to block the deployment of the network by the Community Multisig.

### After sale

The after sale period is considered from the final block (inclusive) until the sale contract is destroyed.

#### 9. `sale.finalizeSale()` – 105,348 gas

This method will mint an additional 3/7 of tokens so at the end of the sale Aragon Dev will own 30% of all the ANTv1 supply.

In the process of doing so, it will make the ANPlaceholder the controller of the token contract. Which will make the token supply be constant until the Aragon Network is deployed and it implements a new minting policy.

#### 10. `sale.deployNetwork()` – 22,338 gas

After the sale is finalized, the Community Multisig will eventually be able to provide the address of an already deployed Aragon Network.

The ANPlaceholder will transfer its Token Controller power of ANTv1 to the deployed Aragon Network, allowing the Network to mint further tokens if the Network's governance decides so.

The sale contract is now selfdestructed in favor of the Aragon Network, though it shouldn't have any ether.

<img src="./assets/an_deploy.png"/>

### Token operations

#### `transfer()` – 95,121 gas
#### `grantVestedTokens()` – 163,094 gas
