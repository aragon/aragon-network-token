# Aragon Network Token Controller

[![Build Status](https://img.shields.io/github/workflow/status/aragon/aragon-network-token/ci:controller?style=flat-square)](https://github.com/aragon/aragon-network-token/actions?query=workflow%3Aci%3Acontroller)

The final, non-changeable controller of the Aragon Network Token.

Now set as ANT's controller, it limits ANT's token controller related functionality to only allowing a specified address to call `generateTokens()`.

## Status

This package is in _preservation_ mode.

This token controller was deployed and set to be ANT's controller in August 2020.

## Development

```sh
yarn install
yarn test
```

This will compile the mocks in [`mocks/`](mocks/) and run the [unit tests](test/).

CI for this package is run through the [`ci_controller` Github action](../../.github/workflows/ci_controller.yml).

## E2E tests

[E2E tests](e2e) are performed through a Ganache-based fork of mainnet state. To run them:

```sh
FORK_NODE=<URL of mainnet RPC> yarn test:e2e`
```

See [the `buidler.config.e2e.js` configuration](buidler.config.e2e.js) for more information about the fork's configuration.

Note that `AragonTokenSale.sol` collides with `ANT.sol` during compilation, so E2E-mocks are [placed separately](e2e/mocks/) from the unit test mocks.
