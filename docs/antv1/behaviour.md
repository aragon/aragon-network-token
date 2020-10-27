# ANTv1 token behaviour

**👉 Important information**:

- ANTv1's token contract address is [`0x960b236A07cf122663c4303350609A66A7B288C0`](https://etherscan.io/token/0x960b236A07cf122663c4303350609A66A7B288C0)
- ANTv1 is a ERC20 token, specifically a [MiniMe token](../developers/minime.md)
- Its current controller is a non-changeable controller, [`0x2443d44325bb07861Cd8C9C8Ba1569b6c39D9d95`](https://etherscan.io/address/0x2443d44325bb07861Cd8C9C8Ba1569b6c39D9d95), only allowing a specified address to mint more tokens
- [ANTv1 has been deprecated in favour of ANTv2](./upgrade), but ANTv1 will forever be a functional ERC-20 token that is transferable and tradable

## Introduction

The original Aragon Network Token ("ANTv1" and sometimes "ANT (old)") is an ERC20-compliant token deployed to Ethereum mainnet. It was launched through the [Aragon Network Token sale](https://aragon.org/blog/announcing-the-aragon-network-token-sale-fe83fe36902c) in May, 2017.

Although previously configurable, the token will now (and forever) closely mimic a vanilla ERC20 token:

- Its supply, and holders' balances, are constant
- All transfers are allowed, with no internal fee mechanisms
- No functionality for blacklisting addresses

In addition to the vanilla behaviour, it implemented a number of features that were intended be used when governing the Aragon Network:

- Historical token balance records
- Cloning, with balances from a specific block snapshot
- An optional controller (see below)

And finally, a specific behaviour was added for the initial launch period:

- Irrevocable time-based vesting from a whitelisted granter, used during the token sale and afterwards to generate the [presale allocations](https://aragon.org/blog/pre-sale-transparency-report-333e310304c)

## Controller

The controller of a MiniMe token holds significant power over the token itself (more information available in the [MiniMe section](./minime#optional-token-controller)).

The current controller of ANT is a **final, non-changeable** contract, [`ANTController`](https://etherscan.io/address/0x2443d44325bb07861Cd8C9C8Ba1569b6c39D9d95#code). This contract limits the token controller related function of ANT to only allowing a specified address to call `generateTokens()`.

Currently this address is the [Community Multisig](./sale-resources#community-multisig) and will be revoked in the near future.

## ANTv2 upgrade

In light of technical advancements in the Ethereum and decentralized technology ecosystems, [ANTv1 has been deprecated in favour of ANTv2 as the Aragon Network's governance token](./upgrade).

Despite being deprecated, ANTv1 is forever "unstoppable": it will continue to be transferable and tradable on Ethereum.
