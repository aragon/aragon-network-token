const abi = require('web3-eth-abi')
const { bn, MAX_UINT256, ZERO_ADDRESS } = require('@aragon/contract-helpers-test')
const { assertBn, assertEvent, assertRevert } = require('@aragon/contract-helpers-test/src/asserts')
const { CHAIN_ID } = require('./helpers/chain')
const { tokenAmount } = require('./helpers/tokens')

const ANTv1 = artifacts.require('ANT')
const ANTv2 = artifacts.require('ANTv2')
const ANTv2Migrator = artifacts.require('ANTv2Migrator')

contract('ANTv2Migrator', ([_, owner, holder1, holder2]) => {
  let antv1, antv2, migrator

  async function itMigratesCorrectly(fn, { from, amount }) {
    const fromV1Bal = await antv1.balanceOf(from)
    const fromV2Bal = await antv2.balanceOf(from)
    const antv1Supply = await antv1.totalSupply()
    const antv2Supply = await antv2.totalSupply()

    await fn(from, amount)

    assertBn(await antv1.totalSupply(), antv1Supply, 'migrate: constant supply')
    assertBn(await antv2.totalSupply(), antv2Supply, 'migrate: constant supply')
    assertBn(await antv1.balanceOf(from), fromV1Bal.sub(amount), 'migrate: v1 balance')
    assertBn(await antv2.balanceOf(from), fromV2Bal.add(amount), 'migrate: v2 balance')
  }

  beforeEach('deploy ANTv1', async () => {
    antv1 = await ANTv1.new(ZERO_ADDRESS)

    // Mint some tokens to our dear holders
    await antv1.generateTokens(holder1, tokenAmount(100))
    await antv1.generateTokens(holder2, tokenAmount(200))
  })

  beforeEach('deploy ANTv2', async () => {
    antv2 = await ANTv2.new(CHAIN_ID, owner)
  })

  beforeEach('deploy ANTv2Migrator', async () => {
    migrator = await ANTv2Migrator.new(owner, antv1.address, antv2.address)
    antv2.changeMinter(migrator.address, { from: owner })
  })

  context('initiated', () => {
    beforeEach(async () => {
      await migrator.initiate({ from: owner })
    })

    it('set up ANTv2Migrator correctly', async () => {
      assert.equal(await migrator.owner(), owner, 'initiate: owner')
      assert.equal(await migrator.antv1(), antv1.address, 'initiate: antv1')
      assert.equal(await migrator.antv2(), antv2.address, 'initiate: antv2')
    })

    it('set up ANTv2 correctly', async () => {
      assertBn(await antv1.totalSupply(), await antv2.totalSupply(), 'initiate: supply')
      assertBn(await antv2.balanceOf(migrator.address), await antv2.totalSupply(), 'initiate: migrator balance')
      assertBn(await antv2.balanceOf(holder1), 0, 'initiate: holder balance')
      assertBn(await antv2.balanceOf(holder2), 0, 'initiate: holder balance')
    })

    context('approve some', () => {
      const amount = tokenAmount(10)

      beforeEach(async () => {
        await antv1.approve(migrator.address, amount, { from: holder1 })
      })

      it('can migrate some', async () => {
        await itMigratesCorrectly(
          (from, amount) => migrator.migrate(amount, { from }),
          {
            from: holder1,
            amount: tokenAmount(5)
          }
        )
      })

      it('can migrate multiple times', async () => {
        await itMigratesCorrectly(
          (from, amount) => migrator.migrate(amount, { from }),
          {
            from: holder1,
            amount: tokenAmount(5)
          }
        )

        await itMigratesCorrectly(
          (from, amount) => migrator.migrate(amount, { from }),
          {
            from: holder1,
            amount: tokenAmount(5)
          }
        )
      })

      it('cannot migrate all', async () => {
        const fullBag = await antv1.balanceOf(holder1)
        await assertRevert(migrator.migrate(fullBag, { from: holder1 }))
      })
    })

    context('approve all', () => {
      let fullBag

      beforeEach(async () => {
        fullBag = await antv1.balanceOf(holder1)
        await antv1.approve(migrator.address, fullBag, { from: holder1 })
      })

      it('can migrate some', async () => {
        await itMigratesCorrectly(
          (from, amount) => migrator.migrate(amount, { from }),
          {
            from: holder1,
            amount: tokenAmount(5)
          }
        )
      })

      it('can migrate all', async () => {
        await itMigratesCorrectly(
          (from, amount) => migrator.migrate(amount, { from }),
          {
            from: holder1,
            amount: fullBag
          }
        )
      })
    })

    context('approve infinity', () => {
      beforeEach(async () => {
        await antv1.approve(migrator.address, MAX_UINT256, { from: holder1 })
      })

      it('can migrate some', async () => {
        await itMigratesCorrectly(
          (from, amount) => migrator.migrate(amount, { from }),
          {
            from: holder1,
            amount: tokenAmount(5)
          }
        )
      })

      it('can migrate all', async () => {
        const fullBag = await antv1.balanceOf(holder1)
        await itMigratesCorrectly(
          (from, amount) => migrator.migrate(amount, { from }),
          {
            from: holder1,
            amount: fullBag
          }
        )
      })
    })

    context('approveAndCall', () => {
      it('can migrate some', async () => {
        await itMigratesCorrectly(
          (from, amount) => antv1.approveAndCall(migrator.address, amount, '0x', { from }),
          {
            from: holder1,
            amount: tokenAmount(5)
          }
        )
      })

      it('can migrate multiple times', async () => {
        await itMigratesCorrectly(
          (from, amount) => antv1.approveAndCall(migrator.address, amount, '0x', { from }),
          {
            from: holder1,
            amount: tokenAmount(5)
          }
        )

        await itMigratesCorrectly(
          (from, amount) => antv1.approveAndCall(migrator.address, amount, '0x', { from }),
          {
            from: holder1,
            amount: tokenAmount(5)
          }
        )
      })

      it('can migrate all', async () => {
        const fullBag = await antv1.balanceOf(holder1)
        await itMigratesCorrectly(
          (from, amount) => antv1.approveAndCall(migrator.address, amount, '0x', { from }),
          {
            from: holder1,
            amount: fullBag
          }
        )
      })

      it('can migrate all with infinity approval', async () => {
        const fullBag = await antv1.balanceOf(holder1)
        await itMigratesCorrectly(
          (from) => {
            // Infinity approve and call
            return antv1.approveAndCall(migrator.address, MAX_UINT256, '0x', { from })
          },
          {
            from: holder1,
            // Should transfer full balance
            amount: fullBag
          }
        )
      })

      it('can migrate all using the raw transaction data', async () => {
        const fullBag = await antv1.balanceOf(holder1)
        await itMigratesCorrectly(
          async (from) => {
            // Raw transaction for infinity approveAndCall
            const calldata =
              `0xcae9ca51000000000000000000000000${migrator.address.slice(2)}ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000`
            return antv1.sendTransaction({ from, data: calldata })
          },
          {
            from: holder1,
            // Should transfer full balance
            amount: fullBag
          }
        )
      })
    })
  })

  context('not initiated', () => {
    context('is owner', () => {
      it('can be initiated', async () => {
        const { receipt: { rawLogs } } = await migrator.initiate({ from: owner })

        assertBn(await antv1.totalSupply(), await antv2.totalSupply(), 'initiate: supply')
        assert.equal(await antv2.minter(), owner, 'initiate: minter')
        assertEvent({ rawLogs }, 'Transfer', { index: 0, decodeForAbi: ANTv2.abi })
      })
    })

    context('not owner', () => {
      it('cannot be initiated', async () => {
        await assertRevert(migrator.initiate())
      })
    })

    it('antv2 has no supply yet', async () => {
      assertBn(await antv2.totalSupply(), 0, 'antv2: no supply until initiated')
    })

    it('cannot migrate any yet', async () => {
      await assertRevert(migrator.migrate(bn(1), { from: holder1 }))
    })
  })
})
