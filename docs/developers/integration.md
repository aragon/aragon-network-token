# Integrating ANT

The current version of ANT, ANTv2, is a lightweight, close-to-vanilla ERC-20 token. It is modelled after [Uniswap's liquidity provider (LP) tokens](https://github.com/Uniswap/uniswap-v2-core/blob/master/contracts/UniswapV2ERC20.sol).

{% hint style="info" %}
Right off the bat, if your application handles vanilla ERC-20s (or the aforementioned Uniswap LP tokens) without requiring any other functionality, you should be safe to assume ANT can be integrated into your application.
{% endhint %}

## Behaviour

{% hint style="warn" %}
Contracts integrating ANT **cannot** assume ANT will have a fixed total supply. This value can change through the `mint()` and `burn()` functionality.
{% endhint %}

Outside of the above note, and unless you want to leverage its extended functionality, you should be safe to assume that ANT is a completely vanilla ERC-20 implementation.

## "Gasless" functionality

ANTv2 supports gasless transfers and approvals through [ERC-2612](https://eips.ethereum.org/EIPS/eip-2612)'s `permit()` and [ERC-3009](https://eips.ethereum.org/EIPS/eip-3009)'s `transferWithAuthorization()`.

### `permit()`

Allows for a third party to submit an approval on behalf of a signer. Commonly used in account delegation schemes with smart contracts pulling tokens from users (with `transferFrom()`).

### `transferWithAuthorization()`

Allows for a third party to submit a transfer on behalf of a signer.

{% hint style="warn" %}
Note that ANTv2 does not protect against any frontrunning on the signature provided to `transferWithAuthorization()`. This method should **only** be used if the receiving contract can safely receive tokens through a vanilla `transfer()` (rather than a `transferFrom()`).
{% endhint %}

### `getChainId()`

Convenience getter for obtaining the current chain ID known by the token contract.

### `getDomainSeparator()`

Convenience getter for obtaining the current [ERC-712 domain separator](https://eips.ethereum.org/EIPS/eip-712#definition-of-domainseparator) used by the token contract to verify signatures. Useful when constructing and verifying signatures for `permit()` and `transferWithAuthorization()`.

## Permissionless functionality

### `burn()`

Allows any holder to burn their tokens to reduce the token's total supply.

## Protected functionality

### `mint()`

Allows the designated `minter` to mint new tokens to a specific account.

Currently set to the Community Multisig.

### `changeMinter()`

Allows the designated `minter` to transfer the minting role to another account.
