# Aragon Network Token V2

[![Build Status](https://img.shields.io/github/workflow/status/aragon/aragon-network-token/ci:v2?style=flat-square)](https://github.com/aragon/aragon-network-token/actions?query=workflow%3Aci%3Av2)

A lightweight token supporting [ERC-2612](https://eips.ethereum.org/EIPS/eip-2612), [ERC-3009](https://eips.ethereum.org/EIPS/eip-3009), token mints, and token burns. Modelled after [UNI-LP](https://github.com/Uniswap/uniswap-v2-core/blob/v1.0.1/contracts/UniswapV2ERC20.sol) with minimal changes.

## Status

🚨 Pre-audit.

## Development

```sh
yarn install
yarn test
```

This will compile the mocks in [`mocks/`](mocks/) and run the [unit tests](test/).

CI for this package is run through the [`ci_v2` Github action](../../.github/workflows/ci_v2.yml).

### Code style

To limit changes, [`ANTv2.sol`](contracts/ANTv2.sol) carries over the code style of the original `UNI-LP` codebase.

All other contracts use the typical Aragon code style.

## E2E tests

[E2E tests](e2e) are performed through a Ganache-based fork of mainnet state. To run them:

```sh
FORK_NODE=<URL of mainnet RPC> yarn test:e2e:pre-deploy
FORK_NODE=<URL of mainnet RPC> yarn test:e2e:post-deploy
```

### Pre-deploy

Tests a theoretical `ANTv2` and `ANTv2Migrator` deployment with mainnet's ANTv1.

See [the `buidler.config.e2e-pre.js` configuration](buidler.config.e2e.js) for more information about the fork's configuration.

### Post-deploy

Tests a deployed instance of `ANTv2` and `ANTv2Migrator` on mainnet with mainnet's ANTv1.

See [the `buidler.config.e2e-post.js` configuration](buidler.config.e2e.js) for more information about the fork's configuration.

## Credits

- UNI-LP: Uniswap
- SafeMath: DappHub
