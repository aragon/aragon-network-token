# Upgrading to ANTv2

**[ANT is upgrading to ANTv2](https://aragon.org/blog/antv2) 🦅 !**

The original ANT ([`0x960b...88C0`](https://etherscan.io/address/0x960b236A07cf122663c4303350609A66A7B288C0)), now known affectionately as "ANTv1" (or sometimes as "ANT (old)") has been deprecated in favour of ANTv2 ([`0xa117...5A2e`](https://etherscan.io/address/0xa117000000f279d81a1d3cc75430faa017fa5a2e), now "ANT"). Future governance decisions related to the Aragon Network will use ANTv2.

{% hint style="info" %}
If you directly hold ANT, the easiest method of upgrading your ANTv1 is to use the [Upgrade Portal](https://upgrade.aragon.org).
{% endhint %}

## Upgrade paths

{% hint style="info" %}
The ANTv2 upgrade **does not** end at any date. As long as you hold some ANTv1, you will be able to upgrade it 1:1 to an equivalent ANTv2 balance.
{% endhint %}

Depending on where your ANTv1 is held, you may have different options for upgrading to ANTv2.

In general, if you are able to use the [Upgrade Portal](https://upgrade.aragon.org), it is recommended as the easiest method of upgrading. A [user guide](upgrade-portal.md) for the Upgrade Portal is available.

If you prefer raw contract interactions, need to encode one due to a smart wallet, or want to get into the details, you may find the [contract interaction page](upgrade-contract-interaction.md) helpful.

### Wallet

ANTv1 held directly in a non-contract wallet that can connect to dapps (e.g. web wallets, some mobile wallets, most hardware wallets through browser extensions) should find the Upgrade Portal most convenient.

If you'd prefer to send a raw transaction or use the Etherscan interface, please see the [contract interaction page](upgrade-contract-interaction.md).

{% hint style="info" %}
Your wallet may not immediately detect your upgraded ANTv2 balance. In this case, you should be able to find documentation on how to add custom tokens to your wallet's interface. You will want to use `0xa117000000f279D81A1D3cc75430fAA017FA5A2e` as the token address.

For example, if you use Metamask, you can follow [this guide to add custom tokens](https://metamask.zendesk.com/hc/en-us/articles/360015489031-How-to-View-See-Your-Tokens-in-Metamask).
{% endhint %}

### "Smart" / contract wallet

Depending on the type of contract wallet being used, you may or may not be able to use the Upgrade Portal directly.

Assuming your contract wallet can send outward transactions (i.e. interact with other Ethereum smart contracts like Uniswap through arbitrary calls), you will be able to upgrade your ANTv1 without transferring it out of this wallet.

If you cannot connect this wallet to dapps, for example some multisig wallets, you may be forced to send a raw transaction. Please see the [contract interaction page](upgrade-contract-interaction.md).

### Aragon DAO

The available upgrade paths for ANTv1 held in Aragon DAOs depends on whether the DAO has the Agent app installed or not.

**If the DAO has the Agent app installed**, you will be able to directly upgrade the ANTv1 through an Agent transaction. You can accomplish by connecting [Frame](http://frame.sh/) to your DAO and using the Upgrade Portal, using the in-app console with a raw call, or aragonCLI with a raw call.

For those latter options, please understand the [contract interaction
page](upgrade-contract-interaction.md), and use the `exec` command with the appropriate arguments for an `approveAndCall()` interaction.

**If the DAO does not have the Agent app installed**, your options for upgrading the ANTv1 become limited to:

- Either transferring the ANTv1 out to a wallet that can directly interact with the Upgrade Portal or contracts
- Deploying an [`EscrowANTv2Migrator`](https://github.com/aragon/aragon-network-token/blob/master/packages/v2/contracts/EscrowANTv2Migrator.sol) contract parameterized to your DAO's Vault (or other asset-holding app), transferring the ANTv1 to that new contract, and then finally calling the `migrate()` function

### On-chain exchange

No automatic migration of on-chain liquidity is currently provided. If you have provided ANT as on-chain liquidity, please withdraw your ANT and migrate through the other options listed here.

You may find the information about [migrating on-chain liquidity](upgrade-migrating-liquidity.md) to be useful, especially if you are interested in re-providing ANTv2 as on-chain liquidity.

### Off-chain ("centralized") exchange

Most exchanges and related service providers have been notified of the upgrade and are committed to completing the migration as quickly as possible for their customers. Please check with your service on their upgrade schedule separately.

A mostly-up-to-date list of supporting exchanges can be found on [this page](https://aragon.org/token/exchanges).

## Terminology

ANT still represents the same underlying asset: a governance token over the Aragon Network.

ANTv2, as the latest version of the token and the one used for Aragon Network governance, currently carries the official "ANT" moniker. User interfaces across services and dapps are being updated to reflect this.

You may identify if an interface lists ANTv2 as "ANT" if it uses the new token icon ("white eagle" rather than ANTv1's "blue eagle"), or by double checking its token address to be [`0xa117000000f279D81A1D3cc75430fAA017FA5A2e`](https://etherscan.io/address/0xa117000000f279d81a1d3cc75430faa017fa5a2e) ("a117 saze", after the first four and last four characters).

ANTv1 should now appear as "ANTv1" or "ANT (old)". Its name should be updated to "Aragon Network Token v1", but associated with the same logo as before ("blue eagle").
