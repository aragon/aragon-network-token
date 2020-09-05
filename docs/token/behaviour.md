# Aragon Network Token

**👉 Important information**:

- ANT's token contract address is [`0x960b236A07cf122663c4303350609A66A7B288C0`](https://etherscan.io/token/0x960b236A07cf122663c4303350609A66A7B288C0)
- ANT is a ERC20 token, specifically a [MiniMe token](../developers/minime.md)
- Its current controller is a [pass-through placeholder](#controller), meant to be replaced for the [Aragon Network](https://aragon.network/)

## Introduction

The Aragon Network Token ("ANT") is an ERC20-compliant token deployed to Ethereum mainnet. It was launched through the [Aragon Network Token sale](https://aragon.org/blog/announcing-the-aragon-network-token-sale-fe83fe36902c) in May, 2017.

In its current configuration, the token's behaviour mimics a vanilla ERC20 token:

- Its supply, and holders' balances, are constant
- All transfers are allowed, with no internal fee mechanisms
- No functionality for blacklisting addresses

In addition to the vanilla behaviour, it implements a number of features that are useful for the Aragon Network:

- Historical token balance records
- Cloning, with balances from a specific block snapshot
- An optional controller (see below)

And finally, a specific behaviour for the initial launch period:

- Irrevocable time-based vesting from a whitelisted granter, used during the token sale and to afterwards to generate the [presale allocations](https://aragon.org/blog/pre-sale-transparency-report-333e310304c)

## Controller

The controller of a MiniMe token holds significant power over the token itself (more information available in the [developers' section on MiniMes](../developers/minime#optional-token-controller)).

The current controller of ANT is a **final, non-changeable** contract, [`ANTController`](https://etherscan.io/address/0x2443d44325bb07861Cd8C9C8Ba1569b6c39D9d95#code). This contract limits the token controller related function of ANT to only allowing a specified address to call `generateTokens()`.

Currently this address is the [Community Multisig](./sale-resources#community-multisig), but will be [transitioned to the Aragon Network DAO in its Firebird phase](https://aragon.org/blog/ant-controller).
