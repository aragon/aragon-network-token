const { bigExp, bn, getEventAt, getEventArgument, MAX_UINT256, ZERO_ADDRESS } = require('@aragon/contract-helpers-test')
const { assertBn, assertEvent, assertRevert } = require('@aragon/contract-helpers-test/src/asserts')

const ANTController = artifacts.require('ANTController')
const ANTMock = artifacts.require('ANT')
const MiniMeTokenFactory = artifacts.require('MiniMeTokenFactory')

function tokenAmount(amount) {
  return bigExp(amount, 18)
}

contract('ANTController', ([_, minter, newMinter, holder1, holder2, holder3, newHolder]) => {
  let ant, antController

  beforeEach('deploy ANT', async () => {
    factory = await MiniMeTokenFactory.new()
    ant = await ANTMock.new(factory.address)

    // Mint some tokens to our dear holders
    await ant.generateTokens(holder1, tokenAmount(100))
    await ant.generateTokens(holder2, tokenAmount(200))
    await ant.generateTokens(holder3, tokenAmount(300))
  })

  beforeEach('set controller', async () => {
    antController = await ANTController.new(ant.address, minter)

    // Irrevocably set the controller to the ANTController
    await ant.changeController(antController.address)
  })

  it('should have set up the token correctly', async () => {
    assert.equal(await ant.name(), 'Aragon Network Token', 'ANT should have correct name')
    assert.equal(await ant.symbol(), 'ANT', 'ANT should have correct symbol')
    assert.equal(await ant.decimals(), '18', 'ANT should have correct decimals')
    assert.isTrue(await ant.transfersEnabled(), 'ANT should allow transfers')

    assertBn(await ant.totalSupply(), tokenAmount(600))
    assertBn(await ant.balanceOf(holder1), tokenAmount(100))
    assertBn(await ant.balanceOf(holder2), tokenAmount(200))
    assertBn(await ant.balanceOf(holder3), tokenAmount(300))
  })

  it('should have set up the controller correctly', async () => {
    assert.equal(await ant.controller(), antController.address, 'ANT should have ANTController as its controller')

    assert.equal(await antController.ant(), ant.address, 'ANTController should have correct ANT')
    assert.equal(await antController.minter(), minter, 'ANTController should have correct minter')
  })

  describe('interactions with ANTController', () => {
    it('emits a ChangedMinter event on deployment', async () => {
      newController = await ANTController.new(ant.address, minter)

      const receipt = await web3.eth.getTransactionReceipt(newController.transactionHash)
      assertEvent({ rawLogs: receipt.logs }, 'ChangedMinter', { index: 0, decodeForAbi: ANTController.abi })
    })

    context('transfer minter role', () => {
      context('when the sender is the current minter', () => {
        it('allows the minter role to be transferred', async () => {
          const receipt = await antController.changeMinter(newMinter, { from: minter })

          assert.equal(await antController.minter(), newMinter, 'ANTController should have set new minter')
          assertEvent(receipt, 'ChangedMinter', { expectedArgs: { minter: newMinter } })
        })
      })

      context('when the sender is not the minter', () => {
        it('disallows the minter role from being transferred', async () => {
          await assertRevert(antController.changeMinter(newMinter, { from: holder1 }))
        })
      })
    })

    context('ANT minting', () => {
      context('when the sender is the current minter', () => {
        async function itMintsTokensCorrectly({ recipient, amount }) {
          const oldSupply = await ant.totalSupply()
          const oldBalance = await ant.balanceOf(recipient)

          const receipt = await antController.generateTokens(recipient, amount, { from: minter })

          assertEvent(receipt,
            'Transfer',
            {
              expectedArgs: {
                from: ZERO_ADDRESS,
                to: recipient,
                value: amount,
              },
              decodeForAbi: ANTMock.abi,
            }
          )
          assertBn(await ant.balanceOf(recipient), bn(oldBalance).add(amount), 'Recipient should have been minted tokens')
          assertBn(await ant.totalSupply(), bn(oldSupply).add(amount), 'ANT total supply have increased by correct amount')
        }

        context('allows tokens to be minted', () => {
          const amounts = [
            bn(1), // tiny
            tokenAmount(10), // small
            tokenAmount(1000000) // large
          ]

          it('for new addresses', async () => {
            for (const amount of amounts) {
              await itMintsTokensCorrectly({ recipient: newHolder, amount })
            }
          })

          it('for addresses already holding ANT', async () => {
            for (const amount of amounts) {
              await itMintsTokensCorrectly({ recipient: holder1, amount })
            }
          })
        })
      })

      context('when the sender is not the minter', () => {
        it('disallows tokens from being generated', async () => {
          const oldSupply = await ant.totalSupply()

          await assertRevert(antController.generateTokens(newHolder, tokenAmount(10), { from: newHolder }))
          await assertRevert(antController.generateTokens(holder1, tokenAmount(10), { from: holder1 }))

          assertBn(await ant.totalSupply(), oldSupply, 'ANT total supply should not have changed')
        })
      })
    })
  })

  describe('interactions with ANT', () => {
    context('ANT transfers', () => {
      let oldSupply

      before(async () => {
        oldSupply = await ant.totalSupply()
      })

      async function itTransfersCorrectly({ transferFn, from, to, amount }) {
        const oldFromBalance = await ant.balanceOf(from)
        const oldToBalance = await ant.balanceOf(to)

        amount = amount === 'all' ? oldFromBalance : amount
        const receipt = await transferFn(from, to, amount)

        assertEvent(receipt,
          'Transfer',
          {
            expectedArgs: {
              from: from,
              to: to,
              value: amount,
            },
            decodeForAbi: ANTMock.abi,
          }
        )
        assertBn(await ant.balanceOf(from), oldFromBalance.sub(amount), 'From account should have transferred away tokens')
        assertBn(await ant.balanceOf(to), oldToBalance.add(amount), 'To account should have received tokens')
        assertBn(await ant.totalSupply(), oldSupply, 'ANT total supply should not have changed')
      }

      async function itFailsToTransferMoreThanOwned({ transferFn, from, to }) {
        const oldFromBalance = await ant.balanceOf(from)
        const oldToBalance = await ant.balanceOf(to)

        const tooLargeAmount = oldFromBalance.add(bn(1))
        await assertRevert(transferFn(from, to, tooLargeAmount))

        assertBn(await ant.balanceOf(from), oldFromBalance, 'From account should not have transferred away tokens')
        assertBn(await ant.balanceOf(to), oldToBalance, 'To account should not have received tokens')
        assertBn(await ant.totalSupply(), oldSupply, 'ANT total supply should not have changed')
      }

      context('allows transfers', () => {
        const amounts = [
          bn(1), // tiny
          tokenAmount(10), // small
          'all', // full remaining balance
        ]
        const from = holder1
        const transferFn = (from, to, amount) => ant.transfer(to, amount, { from })

        it('to new addresses', async () => {
          const to = newHolder

          for (const amount of amounts) {
            await itTransfersCorrectly({ transferFn, from, to, amount })
          }
        })

        it('to addresses already holding ANT', async () => {
          const to = holder2

          for (const amount of amounts) {
            await itTransfersCorrectly({ transferFn, from, to, amount })
          }
        })
      })

      context('allows pulling tokens via transferFrom', async () => {
        const amounts = [
          bn(1), // tiny
          tokenAmount(10), // small
          'all', // full remaining balance
        ]
        const spender = newHolder
        const from = holder1
        const transferFn = (from, to, amount) => ant.transferFrom(from, to, amount, { from: spender })

        it('to itself', async () => {
          const to = spender

          for (const amount of amounts) {
            if (amount === 'all') {
              await ant.approve(spender, MAX_UINT256, { from })
            } else {
              await ant.approve(spender, amount, { from })
            }

            await itTransfersCorrectly({ transferFn, from, to, amount })
          }
        })

        it('to another address', async () => {
          const to = holder2

          for (const amount of amounts) {
            if (amount === 'all') {
              await ant.approve(spender, MAX_UINT256, { from })
            } else {
              await ant.approve(spender, amount, { from })
            }

            await itTransfersCorrectly({ transferFn, from, to, amount })
          }
        })
      })

      it('fails when transferring more tokens than owned', async () => {
        await itFailsToTransferMoreThanOwned({
          transferFn: (from, to, amount) => ant.transfer(to, amount, { from }),
          from: holder1,
          to: holder2,
        })
      })

      it('fails to pull more tokens via transferFrom than owned', async () => {
        // Infinite approval
        await ant.approve(newHolder, MAX_UINT256, { from: holder1 })
        await itFailsToTransferMoreThanOwned({
          transferFn: (from, to, amount) => ant.transferFrom(from, to, amount, { from: newHolder }),
          from: holder1,
          to: holder2,
        })
      })
    })

    context('ANT approvals', () => {
      const from = holder1
      const spender = newHolder
      const approvalAmount = tokenAmount(10)

      context('with no prior approvals', () => {
        it('allows approvals to be made', async () => {
          const receipt = await ant.approve(spender, approvalAmount, { from })

          assertEvent(receipt,
            'Approval',
            {
              expectedArgs: {
                owner: from,
                spender: spender,
                value: approvalAmount,
              },
              decodeForAbi: ANTMock.abi,
            }
          )
          assertBn(await ant.allowance(from, spender), approvalAmount, 'Allowance for spender should be correct')
        })
      })

      context('with a prior approval', () => {
        beforeEach('set up approval', async () => {
          await ant.approve(spender, approvalAmount, { from })
        })

        it('correctly updates approvals after transfers', async () => {
          const transferAmount = tokenAmount(3)
          await ant.transferFrom(from, spender, transferAmount, { from: spender })

          assertBn(await ant.allowance(from, spender), approvalAmount.sub(transferAmount), 'Allowance for spender should be correct')
        })

        it('only allows existing approvals to be changed after resetting', async () => {
          const newApprovalAmount = tokenAmount(100)

          // Should revert
          await assertRevert(ant.approve(spender, newApprovalAmount, { from }))

          // Should allow after resetting
          await ant.approve(spender, 0, { from })
          await ant.approve(spender, newApprovalAmount, { from })

          assertBn(await ant.allowance(from, spender), newApprovalAmount, 'Allowance for spender should be correct')
        })
      })
    })

    context('ANT proxy payments', () => {
      const amounts = [
        bn(1),
        tokenAmount(1)
      ]

      it('reverts on sending ETH to ANT', async () => {
        for (const amount of amounts) {
          await assertRevert(ant.send(amount))
        }
      })

      it('reverts on sending ETH to ANTController', async () => {
        for (const amount of amounts) {
          await assertRevert(antController.send(amount))
        }
      })

      it('reverts on sending ETH to ANTController through proxyPayment', async () => {
        for (const amount of amounts) {
          await assertRevert(antController.proxyPayment(holder1, { from: holder1, value: amount }))
        }
      })
    })

    context('ANT controller functionality', () => {
      context('when calling ANT directly', () => {
        const from = holder1

        const cases = [
          [minter, 'minter'], // minter is privileged, so perhaps it can do more?
          [holder1, 'random account'],
        ]
        for (const [from, desc] of cases) {
          it(`disallows all controller functionality (from: ${desc})`, async () => {
            await assertRevert(ant.changeController(from, { from }))

            await assertRevert(ant.enableTransfers(true, { from }))
            await assertRevert(ant.enableTransfers(false, { from }))

            await assertRevert(ant.generateTokens(from, tokenAmount(10), { from }))
            await assertRevert(ant.generateTokens(minter, tokenAmount(10), { from }))

            await assertRevert(ant.destroyTokens(from, tokenAmount(10), { from }))
            await assertRevert(ant.destroyTokens(holder2, tokenAmount(10), { from }))
          })
        }
      })

      context('when calling through ANTController', () => {
        // This is a bit shallow of a test, but is meant to test whether the controller proxies any
        // calls over to ANT.
        let antControllerMockedAsAnt

        beforeEach('set up controller mocked as ANT', async () => {
          antControllerMockedAsAnt = await ANTMock.at(antController.address)
        })

        it('allows generateTokens when called from the minter', async () => {
          const from = minter

          await antControllerMockedAsAnt.generateTokens(from, tokenAmount(10), { from })
          await antControllerMockedAsAnt.generateTokens(minter, tokenAmount(10), { from })
        })

        it('disallows generateTokens when not called from the minter', async () => {
          const from = holder1

          await assertRevert(antControllerMockedAsAnt.generateTokens(from, tokenAmount(10), { from }))
          await assertRevert(antControllerMockedAsAnt.generateTokens(minter, tokenAmount(10), { from }))
        })

        const cases = [
          [minter, 'minter'], // minter is privileged, so perhaps it can do more?
          [holder1, 'random account'],
        ]
        for (const [from, desc] of cases) {
          it(`does not proxy through other calls (from: ${desc})`, async () => {
            await assertRevert(antControllerMockedAsAnt.changeController(from, { from }))

            await assertRevert(antControllerMockedAsAnt.enableTransfers(true, { from }))
            await assertRevert(antControllerMockedAsAnt.enableTransfers(false, { from }))

            await assertRevert(antControllerMockedAsAnt.destroyTokens(from, tokenAmount(10), { from }))
            await assertRevert(antControllerMockedAsAnt.destroyTokens(holder2, tokenAmount(10), { from }))
          })
        }
      })
    })

    context('ANT cloning', () => {
      const name = 'Cloned ANT'
      const symbol = 'cANT'
      const decimals = '18'
      let cloneAnt

      beforeEach('clone token', async () => {
        const currentBlock = await web3.eth.getBlockNumber()

        const receipt = await ant.createCloneToken(name, decimals, symbol, currentBlock, true)

        const cloneAntAddress = getEventArgument(receipt, 'NewCloneToken', '_cloneToken')
        cloneAnt = await ANTMock.at(cloneAntAddress)
      })

      it('clones with the correct details', async () => {
        assert.equal(await cloneAnt.parentToken(), ant.address, 'Clone should have correct parent')
        assert.equal(await cloneAnt.name(), name, 'Clone should have correct name')
        assert.equal(await cloneAnt.symbol(), symbol, 'Clone should have correct symbol')
        assert.equal(await cloneAnt.decimals(), decimals, 'Clone should have correct decimals')

        assertBn(await ant.balanceOf(holder1), await cloneAnt.balanceOf(holder1), 'Holder1 balance should match')
        assertBn(await ant.balanceOf(holder2), await cloneAnt.balanceOf(holder2), 'Holder2 balance should match')
        assertBn(await ant.balanceOf(holder3), await cloneAnt.balanceOf(holder3), 'Holder3 balance should match')
      })

      it('parent controller should not control new clone', async () => {
        assert.notEqual(await cloneAnt.controller, antController.address, "Clone should not be controlled by parent's controller")
      })

      it('tracks clone balances separately from the parent token', async () => {
        const oldFromBalance = await cloneAnt.balanceOf(holder1)
        const oldToBalance = await cloneAnt.balanceOf(newHolder)
        const amount = tokenAmount(10)

        await cloneAnt.transfer(newHolder, amount, { from: holder1 })

        assertBn(await ant.balanceOf(holder1), oldFromBalance, 'From balance on parent token should not have changed')
        assertBn(await ant.balanceOf(newHolder), oldToBalance, 'To balance on parent token should not have changed')
        assertBn(await cloneAnt.balanceOf(holder1), oldFromBalance.sub(amount), 'From balance on clone token balance should have changed')
        assertBn(await cloneAnt.balanceOf(newHolder), oldToBalance.add(amount), 'To balance on clone token balance should have changed')
      })
    })
  })
})
