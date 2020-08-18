# Aragon Network Token Controller

[![Build Status](https://img.shields.io/github/workflow/status/aragon/aragon-network-token/ci:controller?style=flat-square)](https://github.com/aragon/aragon-network-token/actions?query=workflow%3Aci%3Acontroller)

The final, non-changeable controller of the Aragon Network Token.

Once set as ANT's controller, it will limit the token controller functionality to only allowing a specified address to call `generateTokens()`.

## Status

🚨 Pre-audit.

## Development

```sh
yarn install
yarn test
```

CI for this package is run through the [`ci_controller` Github action](../../.github/workflows/ci_controller.yml).
