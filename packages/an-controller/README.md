# Aragon Network Token Controller

Final, non-changeable controller of the Aragon Network Token.

Once set as ANT's controller, it will limit the token controller functionality to only allowing a specified address to call `generateTokens()`.

## Status

🚨 Pre-audit.

## Development

```sh
yarn install
yarn test
```

CI for this package is run through the [`ci_controller` Github action](../../.github/workflows/ci_controller.yml).
