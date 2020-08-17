# Aragon Network Token sale

[![Build Status](https://img.shields.io/github/workflow/status/aragon/aragon-network-token/ci:sale?style=flat-square)](https://github.com/aragon/aragon-network-token/actions?query=workflow%3Aci%3Asale)

Smart contracts related to the [Aragon Network Token sale](https://aragon.org/blog/aragon-token-sale-technical-overview-9c2a4b910755).

## Status

This package is in _preservation_ mode.

Given that the Aragon Network Token sale occurred in May 2017, we have opted to pin dependencies and build tooling to their original form (or as close as possible).

We therefore specifically target the chain environment and solidity versions used:

- Tests are run on the `byzantium` hardfork
- Contracts are compiled via `solc 0.4.8` (thereby relying on `truffle@3.2.1`)
  - `truffle-provisioner@0.1.2` was pinned to avoid a breaking change introduced in later patch versions for this version of `truffle`

## Development

```sh
yarn install
yarn test
```

CI for this package is run through the [`ci_sale` Github action](../../.github/workflows/ci_sale.yml).
