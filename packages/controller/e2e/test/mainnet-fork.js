const { bigExp, bn, getEventArgument } = require('@aragon/contract-helpers-test')
const { assertBn, assertEvent, assertJump, assertRevert } = require('@aragon/contract-helpers-test/src/asserts')
const MULTISIG_SIGNERS = require('../signers')

const ANTController = artifacts.require('ANTController')

const ANT = artifacts.require('ANT')
const AragonTokenSale = artifacts.require('AragonTokenSale')
const MultisigWallet = artifacts.require('MultisigWallet')

const ANT_ADDRESS = '0x960b236A07cf122663c4303350609A66A7B288C0'
const SALE_ADDRESS = '0x0ceb0d54a7e87dfa16ddf7656858cf7e29851fd7'
const COMMUNITY_MULTISIG_ADDRESS = '0xbeefbeef03c7e5a1c29e0aa675f8e16aee0a5fad'
const ANPLACEHOLDER_ADDRESS = '0xD39902f046B5885D70e9E66594b65f84D4d1c952'

const AA_MULTISIG_ADDRESS = '0xcafe1a77e84698c83ca8931f54a755176ef75f2c'

function tokenAmount(amount) {
  return bigExp(amount, 18)
}

// Note that these tests are meant to be run serially, and each later test is expected to rely
// on state changes from an earlier test!
contract('ANTController (mainnet)', ([_, minter, newMinter, random, random2, random3, bigbags]) => {
  let ant, sale, cMultisig
  let antController

  before('get signers flush with cash', async () => {
    for (const signer of MULTISIG_SIGNERS) {
      await web3.eth.sendTransaction({ from: bigbags, to: signer, value: tokenAmount(5) })
    }
  })

  before('fetch ANTs', async () => {
    ant = await ANT.at(ANT_ADDRESS)
    sale = await AragonTokenSale.at(SALE_ADDRESS)
    cMultisig = await MultisigWallet.at(COMMUNITY_MULTISIG_ADDRESS)

    // Double check the ANPlaceholder is still set
    assert.equal(await ant.controller(), ANPLACEHOLDER_ADDRESS)
  })

  before('deploy new controller', async () => {
    // We'll avoid setting the minter as the cMultisig to make our lives a bit easier here
    antController = await ANTController.new(ant.address, minter)
  })

  before('switch to new controller', async () => {
    const [submitter, ...signers] = MULTISIG_SIGNERS
    const deployNetworkData = sale.contract.methods.deployNetwork(antController.address).encodeABI()

    const receipt = await cMultisig.submitTransaction(sale.address, 0, deployNetworkData, { from: submitter })
    const id = getEventArgument(receipt, 'Submission', 'transactionId')

    for (const signer of signers) {
      await cMultisig.confirmTransaction(id, { from: signer })
    }

    assert.isTrue(await cMultisig.isConfirmed(id))
    assert.equal(await ant.controller(), antController.address)
  })

  it('should pass sanity checks', async () => {
    // Double check top three hodlers
    assertBn(await ant.balanceOf(AA_MULTISIG_ADDRESS), '5216833066039263962000000')
    assertBn(await ant.balanceOf('0x03af24a6db8e011b86c32960ec6ede52ae5906fb'), '3000000000000000000000000')
    assertBn(await ant.balanceOf('0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be'), '2877216490864036239316376')
  })

  describe('changeMinter', () => {
    it('should allow the minter to transfer permissions', async () => {
      await antController.changeMinter(newMinter, { from: minter })
      assert.equal(await antController.minter(), newMinter)

      // Rollback to minter
      await antController.changeMinter(minter, { from: newMinter })
    })

    it('should not allow someone else to change the minter', async () => {
      await assertRevert(antController.changeMinter(newMinter, { from: random }))
      await assertRevert(antController.changeMinter(newMinter, { from: newMinter }))
    })
  })

  describe('minting ANT', () => {
    it('should allow the minter to mint ANT', async () => {
      const amount = tokenAmount(10)

      for (const recipient of [random, AA_MULTISIG_ADDRESS]) {
        const oldBalance = await ant.balanceOf(recipient)
        const oldSupply = await ant.totalSupply()

        await antController.mint(recipient, amount, { from: minter })

        assertBn(await ant.balanceOf(recipient), oldBalance.add(amount))
        assertBn(await ant.totalSupply(), oldSupply.add(amount))
      }
    })

    it('should not allow someone else to mint', async () => {
      const amount = tokenAmount(10)
      const oldSupply = await ant.totalSupply()

      await assertRevert(antController.mint(random, amount, { from: random }))
      await assertRevert(antController.mint(random, amount, { from: newMinter }))

      assertBn(await ant.totalSupply(), oldSupply)
    })
  })

  describe('token operations', () => {
    // Note that we should already have some tokens from the minting tests :)
    it('should allow transfers', async () => {
      const from = random
      const to = random2
      const amount = tokenAmount(1)

      const oldFromBalance = await ant.balanceOf(from)
      const oldToBalance = await ant.balanceOf(to)
      const oldSupply = await ant.totalSupply()

      await ant.transfer(to, amount, { from })

      assertBn(await ant.balanceOf(from), oldFromBalance.sub(amount))
      assertBn(await ant.balanceOf(to), oldToBalance.add(amount))
      assertBn(await ant.totalSupply(), oldSupply)
    })

    it('should allow approvals', async () => {
      const from = random
      const spender = random2
      const amount = tokenAmount(1)

      await ant.approve(spender, amount, { from })

      assertBn(await ant.allowance(from, spender), amount)
    })

    it('should allow changing approvals', async () => {
      const from = random
      const spender = random2
      const amount = tokenAmount(2)

      // We need to reset first
      await assertJump(ant.approve(spender, amount, { from }))

      await ant.approve(spender, 0, { from })
      await ant.approve(spender, amount, { from })

      // Now reset our state for later
      await ant.approve(spender, 0, { from })
    })

    it('should allow transferFroms', async () => {
      const from = random
      const to = random3
      const spender = random2
      const amount = tokenAmount(1)

      const oldFromBalance = await ant.balanceOf(from)
      const oldToBalance = await ant.balanceOf(to)
      const oldSupply = await ant.totalSupply()

      await ant.approve(spender, amount, { from })
      await ant.transferFrom(from, to, amount, { from: spender })

      assertBn(await ant.balanceOf(from), oldFromBalance.sub(amount))
      assertBn(await ant.balanceOf(to), oldToBalance.add(amount))
      assertBn(await ant.totalSupply(), oldSupply)
    })
  })

  describe('proxying ETH', () => {
    it('should not accept ETH sent to ANT contract', async () => {
      await assertJump(ant.send(tokenAmount(1)))
    })

    it('should not accept ETH sent to controller', async () => {
      await assertRevert(antController.send(tokenAmount(1)))
      await assertRevert(antController.proxyPayment(random, { from: random, value: tokenAmount(1) }))
    })
  })

  describe('controller functionality', () => {
    it('does not allow someone else to call controller functionality', async () => {
      const from = random

      await assertJump(ant.changeController(from, { from }))

      await assertJump(ant.enableTransfers(true, { from }))
      await assertJump(ant.enableTransfers(false, { from }))

      await assertJump(ant.generateTokens(from, tokenAmount(10), { from }))
      await assertJump(ant.generateTokens(minter, tokenAmount(10), { from }))

      await assertJump(ant.destroyTokens(from, tokenAmount(10), { from }))
      await assertJump(ant.destroyTokens(AA_MULTISIG_ADDRESS, tokenAmount(10), { from }))
    })

    it('does not proxy any controller functions from controller to token', async () => {
      const from = minter
      const antControllerMockedAsAnt = await ANT.at(antController.address)

      await assertJump(ant.changeController(from, { from }))

      await assertJump(ant.enableTransfers(true, { from }))
      await assertJump(ant.enableTransfers(false, { from }))

      await assertJump(ant.generateTokens(from, tokenAmount(10), { from }))
      await assertJump(ant.generateTokens(minter, tokenAmount(10), { from }))

      await assertJump(ant.destroyTokens(from, tokenAmount(10), { from }))
      await assertJump(ant.destroyTokens(AA_MULTISIG_ADDRESS, tokenAmount(10), { from }))
    })
  })
})
