const { bigExp, bn, getEventArgument, MAX_UINT256, ZERO_ADDRESS } = require('@aragon/contract-helpers-test')
const { assertBn, assertEvent, assertRevert } = require('@aragon/contract-helpers-test/src/asserts')
const BIG_HOLDERS = require('../holders')
const MULTISIG_SIGNERS = require('../signers')

const ANTv1 = artifacts.require('ANT')
const MultisigWallet = artifacts.require('MultisigWallet')

const ANTv2 = artifacts.require('ANTv2')
const ANTv2Migrator = artifacts.require('ANTv2Migrator')
const EscrowANTv2Migrator = artifacts.require('EscrowANTv2Migrator')

const ANTV2_ADDRESS = '0xa117000000f279D81A1D3cc75430fAA017FA5A2e'
const ANTV2MIGRATOR_ADDRESS = '0x078BEbC744B819657e1927bF41aB8C74cBBF912D'

const ANTV1_ADDRESS = '0x960b236A07cf122663c4303350609A66A7B288C0'
const AA_MULTISIG_ADDRESS = '0xcafe1a77e84698c83ca8931f54a755176ef75f2c'
const COMMUNITY_MULTISIG_ADDRESS = '0xbeefbeef03c7e5a1c29e0aa675f8e16aee0a5fad'

const CHAIN_ID = 1

function tokenAmount(amount) {
  return bigExp(amount, 18)
}

// Note that these tests are meant to be run serially, and each later test is expected to rely
// on state changes from an earlier test!
// Also note that ANT was compiled on 0.4.8, and therefore throws invalid JUMPs rather than reverts
contract('ANTv2 migration (post-deploy mainnet)', ([_, interimOwner, seed, guy]) => {
  let antv1, cMultisig
  let antv2, migrator

  before('get spoofed accounts flush with cash', async () => {
    for (const holder of BIG_HOLDERS) {
      await web3.eth.sendTransaction({ from: seed, to: holder, value: tokenAmount(5) })
    }

    for (const signer of MULTISIG_SIGNERS) {
      await web3.eth.sendTransaction({ from: seed, to: signer, value: tokenAmount(5) })
    }
  })

  before('fetch ANTs', async () => {
    antv1 = await ANTv1.at(ANTV1_ADDRESS)
    cMultisig = await MultisigWallet.at(COMMUNITY_MULTISIG_ADDRESS)
  })

  before('fetch ANTv2', async () => {
    antv2 = await ANTv2.at(ANTV2_ADDRESS)
  })

  before('fetch ANTv2Migrator', async () => {
    migrator = await ANTv2Migrator.at(ANTV2MIGRATOR_ADDRESS)
  })

  before('initiate migration', async () => {
    const [submitter, ...signers] = MULTISIG_SIGNERS
    const initiateMigrationData = migrator.contract.methods.initiate().encodeABI()

    const receipt = await cMultisig.submitTransaction(migrator.address, 0, initiateMigrationData, { from: submitter })
    const id = getEventArgument(receipt, 'Submission', 'transactionId')

    for (const signer of signers) {
      await cMultisig.confirmTransaction(id, { from: signer })
    }

    assert.isTrue(await cMultisig.isConfirmed(id))
  })

  it('passes sanity checks', async () => {
    // Double check supply
    assertBn(await antv1.totalSupply(), await antv2.totalSupply())

    // Double check top three hodlers
    assertBn(await antv1.balanceOf(AA_MULTISIG_ADDRESS), '4966833066039263962000000')
    assertBn(await antv1.balanceOf('0xe93381fb4c4f14bda253907b18fad305d799241a'), '3410591882896148000000000')
    assertBn(await antv1.balanceOf('0x03af24a6db8e011b86c32960ec6ede52ae5906fb'), '3000000000000000000000000')

    assertBn(await antv2.balanceOf(AA_MULTISIG_ADDRESS), 0)
    assertBn(await antv2.balanceOf('0xe93381fb4c4f14bda253907b18fad305d799241a'), 0)
    assertBn(await antv2.balanceOf('0x03af24a6db8e011b86c32960ec6ede52ae5906fb'), 0)
  })

  describe('migrate', () => {
    const owner = BIG_HOLDERS[0]
    let initialV1Balance
    let currentV1Balance, currentV2Balance

    before(async () => {
      initialV1Balance = await antv1.balanceOf(owner)
    })

    beforeEach(async () => {
      currentV1Balance = await antv1.balanceOf(owner)
      currentV2Balance = await antv2.balanceOf(owner)
    })

    it('can migrate', async () => {
      const amount = tokenAmount(5)

      await antv1.approve(migrator.address, amount, { from: owner })
      await migrator.migrate(amount, { from: owner })

      assertBn(await antv1.balanceOf(owner), currentV1Balance.sub(amount), 'antv1: post migration balance')
      assertBn(await antv2.balanceOf(owner), amount, 'antv2: post migration balance')
    })

    it('can migrate multiple times', async () => {
      const amount = tokenAmount(5)

      await antv1.approve(migrator.address, amount, { from: owner })
      await migrator.migrate(amount, { from: owner })

      await antv1.approve(migrator.address, amount, { from: owner })
      await migrator.migrate(amount, { from: owner })

      assertBn(await antv1.balanceOf(owner), currentV1Balance.sub(amount.mul(bn(2))), 'antv1: post migration balance')
      assertBn(await antv2.balanceOf(owner), currentV2Balance.add(amount.mul(bn(2))), 'antv2: post migration balance')
    })

    it('can migrate rest', async () => {
      await antv1.approve(migrator.address, currentV1Balance, { from: owner })
      await migrator.migrate(currentV1Balance, { from: owner })
      assertBn(await antv1.balanceOf(owner), 0, 'antv1: all migrated')
      assertBn(await antv2.balanceOf(owner), initialV1Balance, 'antv2: all migrated')
    })
  })

  describe('migrateAll', () => {
    const owner = BIG_HOLDERS[1]
    let initialV1Balance

    before(async () => {
      initialV1Balance = await antv1.balanceOf(owner)
    })

    it('can migrate all', async () => {
      await antv1.approve(migrator.address, MAX_UINT256, { from: owner })
      await migrator.migrateAll({ from: owner })
      assertBn(await antv1.balanceOf(owner), 0, 'antv1: all migrated')
      assertBn(await antv2.balanceOf(owner), initialV1Balance, 'antv2: all migrated')
    })
  })

  describe('approveAndCall', () => {
    const owner = BIG_HOLDERS[2]
    let initialV1Balance
    let currentV1Balance, currentV2Balance

    before(async () => {
      initialV1Balance = await antv1.balanceOf(owner)
    })

    beforeEach(async () => {
      currentV1Balance = await antv1.balanceOf(owner)
      currentV2Balance = await antv2.balanceOf(owner)
    })

    it('can migrate', async () => {
      const amount = tokenAmount(5)

      await antv1.approveAndCall(migrator.address, amount, '0x', { from: owner })

      assertBn(await antv1.balanceOf(owner), currentV1Balance.sub(amount), 'antv1: post migration balance')
      assertBn(await antv2.balanceOf(owner), amount, 'antv2: post migration balance')
    })

    it('can migrate multiple times', async () => {
      const amount = tokenAmount(5)

      await antv1.approveAndCall(migrator.address, amount, '0x', { from: owner })
      await antv1.approveAndCall(migrator.address, amount, '0x', { from: owner })

      assertBn(await antv1.balanceOf(owner), currentV1Balance.sub(amount.mul(bn(2))), 'antv1: post migration balance')
      assertBn(await antv2.balanceOf(owner), currentV2Balance.add(amount.mul(bn(2))), 'antv2: post migration balance')
    })

    it('can migrate rest', async () => {
      await antv1.approveAndCall(migrator.address, currentV1Balance, '0x', { from: owner })
      assertBn(await antv1.balanceOf(owner), 0, 'antv1: all migrated')
      assertBn(await antv2.balanceOf(owner), initialV1Balance, 'antv2: all migrated')
    })
  })

  describe('raw encoded infinity approveAndCall', () => {
    const owner = BIG_HOLDERS[3]
    let initialV1Balance

    before(async () => {
      initialV1Balance = await antv1.balanceOf(owner)
    })

    it('can migrate all', async () => {
      // Raw transaction for infinity approveAndCall
      // Already hardcoded with ANTv2Migrator's address
      const calldata =
        '0xcae9ca51000000000000000000000000078bebc744b819657e1927bf41ab8c74cbbf912dffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000'
      await antv1.sendTransaction({ from: owner, data: calldata })

      assertBn(await antv1.balanceOf(owner), 0, 'antv1: all migrated')
      assertBn(await antv2.balanceOf(owner), initialV1Balance, 'antv2: all migrated')
    })
  })

  describe('with escrow contract', () => {
    const owner = BIG_HOLDERS[4]
    const amount = tokenAmount(100)

    context('allowed by designated account', () => {
      let escrowMigrator

      before(async () => {
        const initialV1Balance = await antv1.balanceOf(owner)

        escrowMigrator = await EscrowANTv2Migrator.new(owner, guy)
        await antv1.transfer(escrowMigrator.address, amount, { from: owner })

        assertBn(await antv1.balanceOf(escrowMigrator.address), amount, 'escrow: held balance')
        assertBn(await antv1.balanceOf(owner), initialV1Balance.sub(amount), 'escrow: owner v1 balance')
      })

      it('cannot be migrated by others', async () => {
        await assertRevert(escrowMigrator.migrate({ from: owner }), 'ESCROW_MIG:NOT_ALLOWED')
      })

      it('can be migrated by designated account', async () => {
        const initialV2Balance = bn(await antv2.balanceOf(owner))

        await escrowMigrator.migrate({ from: guy })

        assertBn(await antv2.balanceOf(owner), initialV2Balance.add(amount), 'escrow: migrated balance')
        assertBn(await antv1.balanceOf(escrowMigrator.address), 0, 'escrow: no v1 balance')
        assertBn(await antv2.balanceOf(escrowMigrator.address), 0, 'escrow: no v2 balance')
      })
    })

    context('allowed by any account', () => {
      let escrowMigrator

      before(async () => {
        const initialV1Balance = await antv1.balanceOf(owner)

        escrowMigrator = await EscrowANTv2Migrator.new(owner, ZERO_ADDRESS)
        await antv1.transfer(escrowMigrator.address, amount, { from: owner })

        assertBn(await antv1.balanceOf(escrowMigrator.address), amount, 'escrow: held balance')
        assertBn(await antv1.balanceOf(owner), initialV1Balance.sub(amount), 'escrow: owner v1 balance')
      })

      it('can be migrated by anyone', async () => {
        const initialV2Balance = bn(await antv2.balanceOf(owner))

        await escrowMigrator.migrate()

        assertBn(await antv2.balanceOf(owner), initialV2Balance.add(amount), 'escrow: migrated balance')
        assertBn(await antv1.balanceOf(escrowMigrator.address), 0, 'escrow: no v1 balance')
        assertBn(await antv2.balanceOf(escrowMigrator.address), 0, 'escrow: no v2 balance')
      })
    })

    context('no balance', () => {
      it('cannot be migrated', async () => {
        const escrowMigrator = await EscrowANTv2Migrator.new(owner, ZERO_ADDRESS)

        await assertRevert(escrowMigrator.migrate(), 'ESCROW_MIG:NO_BALANCE')
      })
    })
  })
})
