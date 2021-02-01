# Aragon Network Token V2

[![Build Status](https://img.shields.io/github/workflow/status/aragon/aragon-network-token/ci:v2?style=flat-square)](https://github.com/aragon/aragon-network-token/actions?query=workflow%3Aci%3Av2)

A lightweight token supporting [ERC-2612](https://eips.ethereum.org/EIPS/eip-2612), [ERC-3009](https://eips.ethereum.org/EIPS/eip-3009), token mints, and token burns. Modelled after [UNI-LP](https://github.com/Uniswap/uniswap-v2-core/blob/v1.0.1/contracts/UniswapV2ERC20.sol) with minimal changes.

## Status

This package is in _preservation_ mode.

ANTv2 was deployed in October 2020.

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


### Rinkeby Network Addresses

**tokenAntV1:** '0x59f24735b61e6ef7E5A52F5F7bB708D1c0141C5A',
**tokenAntV2:** '0xf0f8D83CdaB2F9514bEf0319F1b434267be36B5c',
**tokenAnj:** '0x96286BbCac30Cef8dCB99593d0e28Fabe95F3572',
**ANTv2Migrator:** '0xF45C53D13bF1F5f757E3331e258589a6f30e662F',
**ANJNoLockMinter:** '0xEE25745890bc04bCF926436Ef3Ce490089d89F05',
**ANTv2MultiMinter**: 0xF64bf861b8A85927FAdd9724E80C2987f82a9259

**Deployed By** : 0x94C34FB5025e054B24398220CBDaBE901bd8eE5e (Giorgi)

### Mainnet Network Addresses

**tokenAntV1:** '0x960b236A07cf122663c4303350609A66A7B288C0',
**tokenAntV2:** '0xa117000000f279D81A1D3cc75430fAA017FA5A2e',
**tokenAnj:** '0xcD62b1C403fa761BAadFC74C525ce2B51780b184',
**ANTv2Migrator:** '0x078BEbC744B819657e1927bF41aB8C74cBBF912D',
**ANJNoLockMinter:** '0xc02216cE9Fb7a5Fe22768744332D0B12aBa12a31',
**ANTv2MultiMinter**: 0xA693F70231Eb6de95C6085f330AD40Af66b54F2E

**Deployed By** : 0x9416C2191B49bC4E1E614f7d63035b294Ad30D19 (Samuel)


* ANTv2's minter can only be changed by ANTv2MultiMinter.
* ANJNoLockMinter is added as one of the minters in ANTv2MultiMinter.


## Credits

- UNI-LP: Uniswap
- SafeMath: DappHub
