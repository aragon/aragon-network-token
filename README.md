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
    <a href="https://discord.gg/ruBR6GN">
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

Smart contracts and technical resources for the [Aragon Network Token](https://aragon.org/token/ant).

- ✅ ANT's token address is [`0x960b236A07cf122663c4303350609A66A7B288C0`](https://etherscan.io/token/0x960b236A07cf122663c4303350609A66A7B288C0)
- 🔍 Audits and security details are available in the [security policy](SECURITY.md)
- 🔑 Information about the Multisig wallets involved in the sale are available [in the wiki](https://wiki.aragon.org/association/multisigs/overview/)
- 📚 Technical documentation is available [in the repo](docs/) or as a [Gitbook](docs.aragon.org/ant)

## Structure

This repo is divided into multiple independent sub-packages:

- [`sale`](packages/sale): the original token sale contracts, including the [official ANT token contract](packages/sale/contracts/ANT.sol)

## Important contracts

### Token

- [ANT.sol](packages/sale/contracts/ANT.sol): Main contract for the token. Derives MiniMeIrrevocableVestedToken.
- [MiniMeIrrevocableVestedToken.sol](packages/sale/contracts/MiniMeIrrevocableVestedToken.sol): Adds vesting to MiniMeToken. Derives MiniMeToken.
- [MiniMeToken.sol](packages/sale/contracts/MiniMeToken.sol): MiniMe token implementation.

Only the `ANT.sol` contract was deployed (to [`0x960b236A07cf122663c4303350609A66A7B288C0`](https://etherscan.io/token/0x960b236A07cf122663c4303350609A66A7B288C0)).

### Sale

- [AragonTokenSale.sol](packages/sale/contracts/AragonTokenSale.sol): Implementation of the initial distribution of ANT.
- [ANPlaceholder.sol](packages/sale/contracts/ANPlaceholder.sol): Placeholder for the Aragon Network before its deployment.
- [SaleWallet.sol](packages/sale/contracts/SaleWallet.sol): Simple contract that will hold all funds until final block of the sale.
- [MultisigWallet.sol](packages/sale/contracts/MultisigWallet.sol): Gnosis multisig used for Aragon and community multisigs.

Deployment addresses for each contract can be [found in the
documentation](docs/token/sale-resources.md#deployments).
