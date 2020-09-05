# Historical token sale resources

General information about the token sale and its history can be found in [the wiki](https://wiki.aragon.org/network/aragon_network_token/).

For the purposes of this technical documentation, we will only be concerned with the sale's deployed contract addresses.

## Deployments

### ANT

Address: [`0x960b236A07cf122663c4303350609A66A7B288C0`](https://etherscan.io/address/0x960b236A07cf122663c4303350609A66A7B288C0)

The ANT token contract.

### ANTController

Address:
[`0x2443d44325bb07861Cd8C9C8Ba1569b6c39D9d95`](https://etherscan.io/address/0x2443d44325bb07861Cd8C9C8Ba1569b6c39D9d95)

ANT's final, non-changeable controller.

### AragonTokenSale

Address: [`0x0cEB0D54A7e87Dfa16dDF7656858cF7e29851fD7`](https://etherscan.io/address/0x0ceb0d54a7e87dfa16ddf7656858cf7e29851fd7#code)

The initial token sale contract.

### SaleWallet

Address: [`0x1B5cdf806E93E60A42EC5812600F8055Ad054865`](https://etherscan.io/address/0x1b5cdf806e93e60a42ec5812600f8055ad054865)

The intermediary wallet holding proceeds from the token sale until it was finalized.

### ANPlaceholder

Address: [`0xD39902f046B5885D70e9E66594b65f84D4d1c952`](https://etherscan.io/address/0xd39902f046b5885d70e9e66594b65f84d4d1c952)

The placeholder controller for ANT, replaceable by the [Community Multisig](#community-multisig).

### Aragon Association ("Dev") Multisig

Address: [`0xcafE1A77e84698c83CA8931F54A755176eF75f2C`](https://etherscan.io/address/0xcafe1a77e84698c83ca8931f54a755176ef75f2c)

Final recipient of the initial token sale proceeds. [More information](https://wiki.aragon.org/association/multisigs/association/).

### Community Multisig

Address: [`0xbEEFbEeF03c7E5a1C29E0Aa675f8E16AEe0A5FAd`](https://etherscan.io/address/0xbeefbeef03c7e5a1c29e0aa675f8e16aee0a5fad)

Controller of replacing the `ANPlaceholder` contract. [More information](https://wiki.aragon.org/association/multisigs/community/).
