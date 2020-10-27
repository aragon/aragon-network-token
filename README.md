<p align="center"><img width="50%" src=".github/assets/aragon_banner.svg"></p>

<div align="center">
  <h4>
    <a href="https://aragon.network">
      Website
    </a>
    <span> | </span>
    <a href="https://docs.aragon.org/ant">
      Documentation
    </a>
    <span> | </span>
    <a href="https://discord.gg/aragon">
      Chat
    </a>
  </h4>
</div>

# Aragon Network Token

<p>
  <!-- Security -->
  <a href="SECURITY.md">
    <img src="https://img.shields.io/badge/security-audited-green?style=flat-square" alt="Security" />
  </a>
</p>

Smart contracts and additional resources for the [Aragon Network Token](https://aragon.org/token/ant).

> 👉 ANT has [upgraded to ANTv2](https://aragon.org/blog/antv2)

- ✅ ANT's token address is [`0xa117000000f279D81A1D3cc75430fAA017FA5A2e`](https://etherscan.io/address/0xa117000000f279d81a1d3cc75430faa017fa5a2e)
- 🧮 ANTv1 can be upgraded to the latest token through the [Upgrade Portal](http://upgrade.aragon.org/)
- 🔍 Audits and security details are available in the [security policy](SECURITY.md)
- 🔑 Information about the original token sale are available [in the docs](https://docs.aragon.org/ant/about-the-token/sale)
- 📚 Additional documentation and user guides are available [in the repo](docs/) or as a [Gitbook](https://docs.aragon.org/ant)

> 👇 ANTv1 is considered deprecated and should be upgraded to ANTv2

- ANTv1's token address is [`0x960b236A07cf122663c4303350609A66A7B288C0`](https://etherscan.io/token/0x960b236A07cf122663c4303350609A66A7B288C0)
- ANTv1's is controlled by a non-changeable controller, [`0x2443d44325bb07861Cd8C9C8Ba1569b6c39D9d95`](https://etherscan.io/address/0x2443d44325bb07861Cd8C9C8Ba1569b6c39D9d95)

## Structure

This repo is divided into multiple independent sub-packages:

- [`v2`](packages/v2): the latest ANT token contract, [ANTv2](packages/v2/contracts/ANTv2.sol)
- [`sale`](packages/sale): the original v1 token sale contracts, including the [ANTv1 token contract](packages/sale/contracts/ANT.sol)
- [`controller`](packages/controller): the final v1 token controller, severely limiting exposed controller functionality.

## Important contracts

### ANTv2

- [ANTv2.sol](packages/v2/contracts/ANTv2.sol): Main contract for the token. Lightweight and supports [ERC-2612](https://eips.ethereum.org/EIPS/eip-2612), [ERC-3009](https://eips.ethereum.org/EIPS/eip-3009), token mints, and token burns.
- [ANTv2Migrator.sol](packages/v2/contracts/ANTv2Migrator.sol): ANTv1 -> ANTv2 token migrator

Both `ANTv2.sol` and `ANTv2Migrator.sol` contracts were deployed (to [`0xa117000000f279D81A1D3cc75430fAA017FA5A2e`](https://etherscan.io/address/0xa117000000f279d81a1d3cc75430faa017fa5a2e) and [`0x078BEbC744B819657e1927bF41aB8C74cBBF912D`](https://etherscan.io/address/0x078BEbC744B819657e1927bF41aB8C74cBBF912D), respectively)

### ANTv1

- [ANT.sol](packages/sale/contracts/ANT.sol): Main contract for the token. Derives MiniMeIrrevocableVestedToken.
- [MiniMeIrrevocableVestedToken.sol](packages/sale/contracts/MiniMeIrrevocableVestedToken.sol): Adds vesting to MiniMeToken. Derives MiniMeToken.
- [MiniMeToken.sol](packages/sale/contracts/MiniMeToken.sol): MiniMe token implementation

Only the `ANT.sol` contract was deployed (to [`0x960b236A07cf122663c4303350609A66A7B288C0`](https://etherscan.io/token/0x960b236A07cf122663c4303350609A66A7B288C0)).

### Sale

- [AragonTokenSale.sol](packages/sale/contracts/AragonTokenSale.sol): Implementation of the initial distribution of ANT
- [ANPlaceholder.sol](packages/sale/contracts/ANPlaceholder.sol): Placeholder for the Aragon Network before its deployment
- [SaleWallet.sol](packages/sale/contracts/SaleWallet.sol): Simple contract that will hold all funds until final block of the sale
- [MultisigWallet.sol](packages/sale/contracts/MultisigWallet.sol): Gnosis multisig used for Aragon and community multisigs

Deployment addresses for each contract can be [found in the documentation](docs/token/sale-resources.md#deployments).

### Controller

- [`ANTController.sol`](packages/controller/contracts/ANTController.sol): The final, non-changeable controller of ANTv1

Only the `ANTController.sol` contract was deployed (to [`0x2443d44325bb07861Cd8C9C8Ba1569b6c39D9d95`](https://etherscan.io/address/0x2443d44325bb07861Cd8C9C8Ba1569b6c39D9d95#code)).
