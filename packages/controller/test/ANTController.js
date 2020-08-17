const { bigExp } = require('@aragon/contract-helpers-test')

const ANTController = artifacts.require('ANTController')
const ANTMock = artifacts.require('ANT')
const MiniMeTokenFactory = artifacts.require('MiniMeTokenFactory')

function tokenAmount(amount) {
  return bigExp(amount, 18).toString()
}

contract('ANTController', ([_, minter, holder1, holder2, holder3]) => {
  let ant, antController

  before('deploy ANT', async () => {
    factory = await MiniMeTokenFactory.new()
    ant = await ANTMock.new(factory.address)

    // Mint some tokens to our dear holders
    await ant.generateTokens(holder1, tokenAmount(100))
    await ant.generateTokens(holder2, tokenAmount(200))
    await ant.generateTokens(holder3, tokenAmount(300))
  })

  before('set controller', async () => {
    // Irrevocably set the controller to the ANTController
    antController = await ANTController.new(ant.address, minter)
    await ant.changeController(antController.address)
  })

  it('should have set up the token correctly', async () => {
    assert.equal(await ant.name(), 'Aragon Network Token', 'ANT should have correct name')
    assert.equal(await ant.symbol(), 'ANT', 'ANT should have correct symbol')
    assert.equal(await ant.decimals(), '18', 'ANT should have correct decimals')
    assert.isTrue(await ant.transfersEnabled(), 'ANT should allow transfers')

    assert.equal(await ant.totalSupply(), tokenAmount(600))
    assert.equal(await ant.balanceOf(holder1), tokenAmount(100))
    assert.equal(await ant.balanceOf(holder2), tokenAmount(200))
    assert.equal(await ant.balanceOf(holder3), tokenAmount(300))
  })

  it('should have set up the controller correctly', async () => {
    assert.equal(await ant.controller(), antController.address, 'ANT should have ANTController as its controller')

    assert.equal(await antController.ant(), ant.address, 'ANTController should have correct ANT')
    assert.equal(await antController.minter(), minter, 'ANTController should have correct minter')
  })

  describe('interactions with ANTController', () => {
    context('transfer minter role', () => {
      context('when the sender is the current minter', () => {
        it('allows the minter role to be transferred', async () => {
        })
      })

      context('when the sender is not the minter', () => {
        it('disallows the minter role from being transferred', async () => {
        })
      })
    })

    context('ANT minting', () => {
      context('when the sender is the current minter', () => {
        it('allows tokens to be generated', async () => {
        })
      })

      context('when the sender is not the minter', () => {
        it('disallows tokens from being generated', async () => {
        })
      })
    })
  })

  describe('interactions with ANT', () => {
    context('ANT transfers', () => {
      it('allows transfers to new addresses', async () => {
      })

      it('allows transfers to addresses already holding ANT', async () => {
      })

      it('allows transferFrom interactions', async () => {
      })
    })

    context('ANT approvals', () => {
      it('allows approvals to be made', async () => {
      })

      it('only allows existing approvals to be changed after resetting', async () => {
      })
    })

    context('ANT proxy payments', () => {
      it('reverts on sending ETH to ANT', async () => {
      })

      it('reverts on sending ETH to ANTController', async () => {
      })
    })

    context('ANT controller functionality', () => {
      it('disallows all controller functionality', async () => {
      })
    })

    context('ANT cloning', () => {
      it('allows ANT to be cloned', () => {
      })
    })
  })
})
