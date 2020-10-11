const { ecsign, ecrecover } = require('ethereumjs-util')
const { keccak256 } = require('web3-utils')
const { bn, MAX_UINT256, ZERO_ADDRESS } = require('@aragon/contract-helpers-test')
const { assertBn, assertEvent, assertRevert } = require('@aragon/contract-helpers-test/src/asserts')
const { CHAIN_ID } = require('./helpers/chain')
const { createDomainSeparator } = require('./helpers/erc712')
const { createPermitDigest, PERMIT_TYPEHASH } = require('./helpers/erc2612')
const { createTransferWithAuthorizationDigest, TRANSFER_WITH_AUTHORIZATION_TYPEHASH } = require('./helpers/erc3009')
const { tokenAmount } = require('./helpers/tokens')

const ANTv2 = artifacts.require('ANTv2')

contract('ANTv2', ([_, minter, newMinter, holder1, holder2, newHolder]) => {
  let ant

  async function itTransfersCorrectly(fn, { from, to, value }) {
    const isMint = from === ZERO_ADDRESS

    const prevFromBal = await ant.balanceOf(from)
    const prevToBal = await ant.balanceOf(to)
    const prevSupply = await ant.totalSupply()

    const receipt = await fn(from, to, value)

    if (isMint) {
      assertBn(await ant.balanceOf(to), prevToBal.add(value), 'mint: to balance')
      assertBn(await ant.totalSupply(), prevSupply.add(value), 'mint: total supply')
    } else {
      assertBn(await ant.balanceOf(from), prevFromBal.sub(value), 'transfer: from balance')
      assertBn(await ant.balanceOf(to), prevToBal.add(value), 'transfer: to balance')
      assertBn(await ant.totalSupply(), prevSupply, 'transfer: total supply')
    }

    assertEvent(receipt, 'Transfer', { expectedArgs: { from, to, value } })
  }

  async function itApprovesCorrectly(fn, { owner, spender, value }) {
    const receipt = await fn(owner, spender, value)

    assertBn(await ant.allowance(owner, spender), value, 'approve: allowance')
    assertEvent(receipt, 'Approval', { expectedArgs: { owner, spender, value } })
  }

  beforeEach('deploy ANTv2', async () => {
    ant = await ANTv2.new(CHAIN_ID, minter)

    await ant.mint(holder1, tokenAmount(100), { from: minter })
    await ant.mint(holder2, tokenAmount(200), { from: minter })
  })

  it('set up the token correctly', async () => {
    assert.equal(await ant.name(), 'Aragon Network Token', 'token: name')
    assert.equal(await ant.symbol(), 'ANT', 'token: symbol')
    assert.equal(await ant.decimals(), '18', 'token: decimals')

    assertBn(await ant.totalSupply(), tokenAmount(300))
    assertBn(await ant.balanceOf(holder1), tokenAmount(100))
    assertBn(await ant.balanceOf(holder2), tokenAmount(200))
  })

  context('mints', () => {
    context('is minter', () => {
      it('can mint', async () => {
        await itTransfersCorrectly(
          (_, to, value) => ant.mint(to, value, { from: minter }),
          {
            from: ZERO_ADDRESS,
            to: newHolder,
            value: tokenAmount(100)
          }
        )
      })

      it('can change minter', async () => {
        const receipt = await ant.changeMinter(newMinter, { from: minter })

        assert.equal(await ant.minter(), newMinter, 'minter: changed')
        assertEvent(receipt, 'ChangeMinter', { expectedArgs: { minter: newMinter } })
      })
    })

    context('not minter', () => {
      it('cannot mint', async () => {
        await assertRevert(ant.mint(newHolder, tokenAmount(100), { from: holder1 }), 'ANTV2:NOT_MINTER')
      })

      it('cannot change minter', async () => {
        await assertRevert(ant.changeMinter(newMinter, { from: holder1 }), 'ANTV2:NOT_MINTER')
      })
    })
  })

  context('transfers', () => {
    context('holds bag', () => {
      it('can transfer tokens', async () => {
        await itTransfersCorrectly(
          (from, to, value) => ant.transfer(to, value, { from }),
          {
            from: holder1,
            to: newHolder,
            value: (await ant.balanceOf(holder1)).sub(tokenAmount(1))
          }
        )
      })

      it('can transfer all tokens', async () => {
        await itTransfersCorrectly(
          (from, to, value) => ant.transfer(to, value, { from }),
          {
            from: holder1,
            to: newHolder,
            value: await ant.balanceOf(holder1)
          }
        )
      })

      it('cannot transfer above balance', async () => {
        await assertRevert(
          ant.transfer(newHolder, (await ant.balanceOf(holder1)).add(bn('1')), { from: holder1 }),
          'MATH:SUB_UNDERFLOW'
        )
      })
    })

    context('bagless', () => {
      it('cannot transfer any', async () => {
        await assertRevert(
          ant.transfer(holder1, bn('1'), { from: newHolder }),
          'MATH:SUB_UNDERFLOW'
        )
      })
    })
  })

  context('approvals', () => {
    const owner = holder1
    const spender = newHolder

    context('has allowance', () => {
      const value = tokenAmount(50)

      beforeEach(async () => {
        await ant.approve(spender, value, { from: owner })
      })

      it('can change allowance', async () => {
        await itApprovesCorrectly(
          (owner, spender, value) => ant.approve(spender, value, { from: owner }),
          { owner, spender, value: value.add(tokenAmount(10)) }
        )
      })

      it('can transfer below allowance', async () => {
        await itTransfersCorrectly(
          (from, to, value) => ant.transferFrom(from, to, value, { from: spender }),
          {
            from: owner,
            to: spender,
            value: value.sub(tokenAmount(1))
          }
        )
      })

      it('can transfer all of allowance', async () => {
        await itTransfersCorrectly(
          (from, to, value) => ant.transferFrom(from, to, value, { from: spender }),
          {
            from: owner,
            to: spender,
            value: value.sub(tokenAmount(1))
          }
        )
      })

      it('cannot transfer above balance', async () => {
        await assertRevert(
          ant.transferFrom(owner, spender, value.add(bn('1')), { from: spender }),
          'MATH:SUB_UNDERFLOW'
        )
      })
    })

    context('has infinity allowance', () => {
      beforeEach(async () => {
        await ant.approve(spender, MAX_UINT256, { from: owner })
      })

      it('can change allowance', async () => {
        await itApprovesCorrectly(
          (owner, spender, value) => ant.approve(spender, value, { from: owner }),
          { owner, spender, value: tokenAmount(10) }
        )
      })

      it('can transfer without changing allowance', async () => {
        await itTransfersCorrectly(
          (from, to, value) => ant.transferFrom(from, to, value, { from: spender }),
          {
            from: owner,
            to: spender,
            value: await ant.balanceOf(owner)
          }
        )

        assertBn(await ant.allowance(owner, spender), MAX_UINT256, 'approve: stays infinity')
      })

      it('cannot transfer above balance', async () => {
        await assertRevert(
          ant.transferFrom(owner, spender, (await ant.balanceOf(owner)).add(bn('1')), { from: spender }),
          'MATH:SUB_UNDERFLOW'
        )
      })
    })

    context('no allowance', () => {
      it('can increase allowance', async () => {
        await itApprovesCorrectly(
          (owner, spender, value) => ant.approve(spender, value, { from: owner }),
          { owner, spender, value: tokenAmount(10) }
        )
      })

      it('cannot transfer', async () => {
        await assertRevert(
          ant.transferFrom(owner, spender, bn('1'), { from: spender }),
          'MATH:SUB_UNDERFLOW'
        )
      })
    })
  })

  context('ERC-712', () => {
    it('has the correct ERC712 domain separator', async () => {
      const domainSeparator = createDomainSeparator(
        await ant.name(),
        bn('1'),
        CHAIN_ID,
        ant.address
      )
      assert.equal(await ant.DOMAIN_SEPARATOR(), domainSeparator, 'erc712: domain')
    })
  })

  context('ERC-2612', () => {
    let owner, ownerPrivKey
    const spender = newHolder

    async function createPermitSignature(owner, spender, value, nonce, deadline) {
      const digest = await createPermitDigest(ant, owner, spender, value, nonce, deadline)

      const { r, s, v } = ecsign(
        Buffer.from(digest.slice(2), 'hex'),
        Buffer.from(ownerPrivKey.slice(2), 'hex')
      )

      return { r, s, v }
    }

    before(async () => {
      const wallet = web3.eth.accounts.create('erc2612')
      owner = wallet.address
      ownerPrivKey = wallet.privateKey
    })

    beforeEach(async () => {
      await ant.mint(owner, tokenAmount(50), { from: minter })
    })

    it('has the correct permit typehash', async () => {
      assert.equal(await ant.PERMIT_TYPEHASH(), PERMIT_TYPEHASH, 'erc2612: typehash')
    })

    it('can set allowance through permit', async () => {
      const deadline = MAX_UINT256

      const firstValue = tokenAmount(100)
      const firstNonce = await ant.nonces(owner)
      const firstSig = await createPermitSignature(owner, spender, firstValue, firstNonce, deadline)
      const firstReceipt = await ant.permit(owner, spender, firstValue, deadline, firstSig.v, firstSig.r, firstSig.s)

      assertBn(await ant.allowance(owner, spender), firstValue, 'erc2612: first permit allowance')
      assertBn(await ant.nonces(owner), firstNonce.add(bn(1)), 'erc2612: first permit nonce')
      assertEvent(firstReceipt, 'Approval', { expectedArgs: { owner, spender, value: firstValue } })

      const secondValue = tokenAmount(500)
      const secondNonce = await ant.nonces(owner)
      const secondSig = await createPermitSignature(owner, spender, secondValue, secondNonce, deadline)
      const secondReceipt = await ant.permit(owner, spender, secondValue, deadline, secondSig.v, secondSig.r, secondSig.s)

      assertBn(await ant.allowance(owner, spender), secondValue, 'erc2612: second permit allowance')
      assertBn(await ant.nonces(owner), secondNonce.add(bn(1)), 'erc2612: second permit nonce')
      assertEvent(secondReceipt, 'Approval', { expectedArgs: { owner, spender, value: secondValue } })
    })

    it('cannot use wrong signature', async () => {
      const deadline = MAX_UINT256
      const nonce = await ant.nonces(owner)

      const firstValue = tokenAmount(100)
      const secondValue = tokenAmount(500)
      const firstSig = await createPermitSignature(owner, spender, firstValue, nonce, deadline)
      const secondSig = await createPermitSignature(owner, spender, secondValue, nonce, deadline)

      // Use a mismatching signature
      await assertRevert(ant.permit(owner, spender, firstValue, deadline, secondSig.v, secondSig.r, secondSig.s), 'ANTV2:INVALID_SIGNATURE')
    })

    it('cannot use expired permit', async () => {
      const value = tokenAmount(100)
      const nonce = await ant.nonces(owner)

      // Use a prior deadline
      const now = bn((await web3.eth.getBlock('latest')).timestamp)
      const deadline = now.sub(bn(60))

      const { r, s, v } = await createPermitSignature(owner, spender, value, nonce, deadline)
      await assertRevert(ant.permit(owner, spender, value, deadline, v, r, s), 'ANTV2:AUTH_EXPIRED')
    })

    it('cannot use surpassed permit', async () => {
      const deadline = MAX_UINT256
      const nonce = await ant.nonces(owner)

      // Generate two signatures with the same nonce and use one
      const firstValue = tokenAmount(100)
      const secondValue = tokenAmount(500)
      const firstSig = await createPermitSignature(owner, spender, firstValue, nonce, deadline)
      const secondSig = await createPermitSignature(owner, spender, secondValue, nonce, deadline)

      // Using one should disallow the other
      await ant.permit(owner, spender, secondValue, deadline, secondSig.v, secondSig.r, secondSig.s)
      await assertRevert(ant.permit(owner, spender, firstValue, deadline, firstSig.v, firstSig.r, firstSig.s), 'ANTV2:INVALID_SIGNATURE')
    })
  })

  context('ERC-3009', () => {
    let from, fromPrivKey
    const to = newHolder

    async function createTransferWithAuthorizationSignature(from, to, value, validBefore, validAfter, nonce) {
      const digest = await createTransferWithAuthorizationDigest(ant, from, to, value, validBefore, validAfter, nonce)

      const { r, s, v } = ecsign(
        Buffer.from(digest.slice(2), 'hex'),
        Buffer.from(fromPrivKey.slice(2), 'hex')
      )

      return { r, s, v }
    }

    before(async () => {
      const wallet = web3.eth.accounts.create('erc3009')
      from = wallet.address
      fromPrivKey = wallet.privateKey
    })

    beforeEach(async () => {
      await ant.mint(from, tokenAmount(50), { from: minter })
    })

    it('has the correct transferWithAuthorization typehash', async () => {
      assert.equal(await ant.TRANSFER_WITH_AUTHORIZATION_TYPEHASH(), TRANSFER_WITH_AUTHORIZATION_TYPEHASH, 'erc3009: typehash')
    })

    it('can transfer through transferWithAuthorization', async () => {
      const validAfter = 0
      const validBefore = MAX_UINT256

      const firstNonce = keccak256('first')
      const secondNonce = keccak256('second')
      assert.equal(await ant.authorizationState(from, firstNonce), false, 'erc3009: first auth unused')
      assert.equal(await ant.authorizationState(from, secondNonce), false, 'erc3009: second auth unused')

      const firstValue = tokenAmount(25)
      const firstSig = await createTransferWithAuthorizationSignature(from, to, firstValue, validAfter, validBefore, firstNonce)
      await itTransfersCorrectly(
        () => ant.transferWithAuthorization(from, to, firstValue, validAfter, validBefore, firstNonce, firstSig.v, firstSig.r, firstSig.s),
        { from, to, value: firstValue }
      )
      assert.equal(await ant.authorizationState(from, firstNonce), true, 'erc3009: first auth')

      const secondValue = tokenAmount(10)
      const secondSig = await createTransferWithAuthorizationSignature(from, to, secondValue, validAfter, validBefore, secondNonce)
      await itTransfersCorrectly(
        () => ant.transferWithAuthorization(from, to, secondValue, validAfter, validBefore, secondNonce, secondSig.v, secondSig.r, secondSig.s),
        { from, to, value: secondValue }
      )
      assert.equal(await ant.authorizationState(from, secondNonce), true, 'erc3009: second auth')
    })

    it('cannot use wrong signature', async () => {
      const validAfter = 0
      const validBefore = MAX_UINT256

      const firstNonce = keccak256('first')
      const firstValue = tokenAmount(25)
      const firstSig = await createTransferWithAuthorizationSignature(from, to, firstValue, validAfter, validBefore, firstNonce)

      const secondNonce = keccak256('second')
      const secondValue = tokenAmount(10)
      const secondSig = await createTransferWithAuthorizationSignature(from, to, secondValue, validAfter, validBefore, secondNonce)

      // Use a mismatching signature
      await assertRevert(
        ant.transferWithAuthorization(from, to, firstValue, validAfter, validBefore, firstNonce, secondSig.v, secondSig.r, secondSig.s),
        'ANTV2:INVALID_SIGNATURE'
      )
    })

    it('cannot use before valid period', async () => {
      const value = tokenAmount(100)
      const nonce = keccak256('nonce')

      // Use a future period
      const now = bn((await web3.eth.getBlock('latest')).timestamp)
      const validAfter = now.add(bn(60))
      const validBefore = MAX_UINT256

      const { r, s, v } = await createTransferWithAuthorizationSignature(from, to, value, validAfter, validBefore, nonce)
      await assertRevert(
        ant.transferWithAuthorization(from, to, value, validAfter, validBefore, nonce, v, r, s),
        'ANTV2:AUTH_NOT_YET_VALID'
      )
    })

    it('cannot use after valid period', async () => {
      const value = tokenAmount(100)
      const nonce = keccak256('nonce')

      // Use a prior period
      const now = bn((await web3.eth.getBlock('latest')).timestamp)
      const validBefore = now.sub(bn(60))
      const validAfter = 0

      const { r, s, v } = await createTransferWithAuthorizationSignature(from, to, value, validAfter, validBefore, nonce)
      await assertRevert(
        ant.transferWithAuthorization(from, to, value, validAfter, validBefore, nonce, v, r, s),
        'ANTV2:AUTH_EXPIRED'
      )
    })

    it('cannot use expired nonce', async () => {
      const value = tokenAmount(100)
      const nonce = keccak256('nonce')
      const validAfter = 0
      const validBefore = MAX_UINT256

      const firstValue = tokenAmount(25)
      const secondValue = tokenAmount(10)
      const firstSig = await createTransferWithAuthorizationSignature(from, to, firstValue, validAfter, validBefore, nonce)
      const secondSig = await createTransferWithAuthorizationSignature(from, to, secondValue, validAfter, validBefore, nonce)

      // Using one should disallow the other
      await ant.transferWithAuthorization(from, to, firstValue, validAfter, validBefore, nonce, firstSig.v, firstSig.r, firstSig.s)
      await assertRevert(
        ant.transferWithAuthorization(from, to, secondValue, validAfter, validBefore, nonce, secondSig.v, secondSig.r, secondSig.s),
        'ANTV2:AUTH_ALREADY_USED'
      )
    })
  })
})
