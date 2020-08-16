const ANController = artifacts.require('ANController');
const ANTMock = artifacts.require('ANT')
const MiniMeTokenFactory = artifacts.require('MiniMeTokenFactory')

contract('ANController', ([_, minter]) => {
  let ant, anController

  before('deploy contracts', async () => {
    factory = await MiniMeTokenFactory.new()
    ant = await ANTMock.new(factory.address)

    anController = await ANController.new(ant.address, minter)

    await ant.changeController(anController.address)
  })

  it('should pass', async function() {
    assert.equal(await ant.controller(), anController.address, 'ANController should be controller of ANT');
  });
});
