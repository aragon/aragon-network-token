# Non-standard behaviour and gotchas

Some specific behaviours encoded into ANT may be useful to be aware of, even when not programmatically interacting with the ANT contract.

## Gas

Because ANT includes historical balance records for each address, token transfers are slightly more expensive than some other tokens.

The exact amount per transfer will differ between hardforks and whether the receiver has previously held an ANT balance before, but it is safe to start with a gas limit of 150,000 and optimize lower over time.

## Changing non-zero allowances

The ANT contract reverts when attempting to modify an allowance (calling `ANT.approve()`) that is not zero. [More details of the rationale behind this](https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729).

To successfully change an allowance in this circumstance, you must first ask the user to reset their allowance for that spender to zero (`ANT.approve(0)`), and then to the amount desired.

It useful to note that this behaviour is considered non-standard for ERC20s, and may lead to problems if ANT is used by a contract that is not designed to handle this behaviour.

## Initially vested tokens

The ANT contract includes specific functionality for whitelisted addresses to create irrevocable time-based token vests by transferring tokens from their own balance.

Some token holders (founders, advisors, and early contributors) received tokens around the initial token sale that were granted in such a way to limit their transferability.

Although all such tokens are now vested and transferable in full, [this blog post](https://aragon.org/blog/a-note-for-exchanges-or-holders-interacting-with-ant-in-an-automated-manner-fe13152c1b36) may still be a useful historical resource for exchanges or other automated market makers interested in integrating with ANT.

## Receiving ETH

Sending ETH directly to the ANT contract will revert. You should never have a reason to want to do this!
