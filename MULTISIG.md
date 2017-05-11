# Aragon Multisig structure

Having a good multisig structure is important for security, ANT holders' trust and ensuring the project can and will do everything as planned.

The Aragon sale will feature two multisigs: The AragonDev Multisig (Aragon core developers) and the Community Multisig.

Both use Gnosis Multisig at commit [25fba5](https://github.com/ConsenSys/gnosis-contracts/blob/25fba563d95bbc8361c7de75801c38ce368cab85/contracts/solidity/Wallets/MultiSigWallet.sol) which was independentely audited. Aragon multisigs were compiled using Solidity v0.4.8 with optimization disabled.

## AragonDev Multisig – Café Latte [0xcafe1a77e84698c83ca8931f54a755176ef75f2c](https://etherscan.io/address/0xcafe1a77e84698c83ca8931f54a755176ef75f2c)

#### Required signatures: 2/3

#### Signers:

- Luis Cuende, Aragon Project Lead. [0xddc1b51b67dabd408b224d0f7dfcc93ec4b06265](https://etherscan.io/address/0xddc1b51b67dabd408b224d0f7dfcc93ec4b06265) – [Proof](https://etherscan.io/tx/0xc7b285395c0cbf09599ffac4aa4a05bced65522994fc94597456fadc7c6c1d3f)
- Jorge Izquierdo, Aragon Tech Lead. [0x4838Eab6F43841E0D233Db4CeA47BD64F614f0c5](https://etherscan.io/address/0x4838eab6f43841e0d233db4cea47bd64f614f0c5) – [Proof](https://etherscan.io/tx/0x5aaeb2d0361dbdf3b4ecadad1b49c239eb1b3b5e1cf973f6a4597ad56edc47b9).
- Community Multisig – [0xbeefbeef03c7e5a1c29e0aa675f8e16aee0a5fad](https://etherscan.io/address/0xbeefbeef03c7e5a1c29e0aa675f8e16aee0a5fad)


#### Responsibilities

- The AragonDev multisig will be the address responsible to control the whole token sale process.
- It will hold the Aragon Foundation ether funds and ANT tokens. It will make the token allocations for founders and early contributors.

#### Rationale

- The decision to introduce the Community Multisig is that in case of a disagreement between Jorge or Luis, no one can extort the other part into locking the multisig forever. With support from the Community Multisig, whoever has the project and community best interests at heart and can convince the community, will be able to kick the other founder out of the multisig, and the project will continue its course.

- Also, if Luis or Jorge were to lose their access to their key, the community multisig could be used to restore access to another key.

## Community multisig – Beef beef [0xbeefbeef03c7e5a1c29e0aa675f8e16aee0a5fad](https://etherscan.io/address/0xbeefbeef03c7e5a1c29e0aa675f8e16aee0a5fad)

#### Required signatures: 3/5

#### Signers

- AragonDev multisig. [0xcafe1a77e84698c83ca8931f54a755176ef75f2c](https://etherscan.io/address/0xcafe1a77e84698c83ca8931f54a755176ef75f2c)
- Joe Urgo, CEO [Sourcerers](http://sourcerers.io) & [Dapp daily](https://dappdaily.com) author. [0x75d83a0ae1543fd4b49594023977e1daf5a954c5](https://etherscan.io/address/0x75d83a0ae1543fd4b49594023977e1daf5a954c5) – [Proof](https://etherscan.io/tx/0x796538ed7dd4d76953b045c6341129f8976fefeb160de72618dc28c50138cc5a).
- Kenny Rowe, COO of Dai Foundation. Governance at [MakerDAO](http://makerdao.com). [0x939428c249a738990d4fb938509a5c43f3ecedcf](https://etherscan.io/address/0x939428c249a738990d4fb938509a5c43f3ecedcf) – [Proof](https://etherscan.io/tx/0x2aea9d83c32328932bef2df2790539ddbcb489f140854d4cc2c063176135a6d6).
- Jake Brukhman, Cofounder of [CoinFund](http://coinfund.io). [0xD4bE3593eb07F97de7E27bE56Ff7aD2f27a72364](https://etherscan.io/address/0xD4bE3593eb07F97de7E27bE56Ff7aD2f27a72364) – [Proof](https://etherscan.io/tx/).

#### Pending signers

- Pending 1

#### Responsibilities

- The community multisig will serve ANT holders and the broader crypto community to ensure Aragon's stated mission is carried.
- The community multisig will be responsible for deploying the Aragon Network code (provided by AragonDev) once it is considered secure to do it and it matches the original expectations of it.
- Solving hypothetic deadlock problems in the AragonDev multisig to ensure resources won't get locked and the project will continue its course.

#### Rationale

- Deploying the Aragon Network is a huge responsibility, and that's why we consider it a community effort. AragonDev will provide the bytecode for such network, but without support from the community it won't be deployed.

- In case of a deadlock, the multisig will be a 4/6 multisig assuming that the AragonDev cannot sign. Support from the community multisig this plus one of the founders can solve the deadlock.
