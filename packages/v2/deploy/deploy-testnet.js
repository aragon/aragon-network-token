const { bigExp } = require('@aragon/contract-helpers-test')

async function deployOnTestnet({ deploy }) {

    const deployer = (await web3.eth.getAccounts())[0];

    const MiniTokenFactory  = artifacts.require('MiniMeTokenFactory');
    const ANJ               = artifacts.require('ANJ');
    const ANTv1             = artifacts.require('ANT')
    const ANTv2             = artifacts.require('ANTv2')
    const ANTv2MultiMinter  = artifacts.require('ANTv2MultiMinter')
    const ANJNoLockMinter   = artifacts.require('ANJNoLockMinter')
    const ANTv2Migrator     = artifacts.require('ANTv2Migrator');
    
    const MiniTokenFactoryInstance  = await MiniTokenFactory.new();
    const ANJInstance               = await ANJ.new(MiniTokenFactoryInstance.address);
    const ANTv1Instance             = await ANTv1.new(MiniTokenFactoryInstance.address);

    // deployer parameter will be the only one that can mint tokens or change the minter.
    const ANTv2Instance             = await ANTv2.new(deployer); 

    // deployer parameter will be the one that can add/remove/changeMinter.
    const ANTv2MultiMinterInstance  = await ANTv2MultiMinter.new(deployer, ANTv2Instance.address); 

    const ANJNoLockMinterInstance   = await ANJNoLockMinter.new(ANTv2MultiMinterInstance.address, ANTv2Instance.address, ANJInstance.address);

    // deployer parameter will be the only one that can call `initiate` that mints the same amount of ANTv2 as ANTv1.
    const ANTv2MigratorInstance     = await ANTv2Migrator.new(deployer, ANTv1Instance.address, ANTv2Instance.address);

    await ANTv2Instance.changeMinter(ANTv2MigratorInstance.address);
    await ANTv1Instance.generateTokens(deployer, bigExp(1000000, 18));

    await ANTv2MigratorInstance.initiate();

    // MultiMinter is the only one that should be able to mint on the ANTv2 instance.
    // This specific call will require to make a transaction to multisigwallet since multisigwallet is the owner of ANTv2.
    await ANTv2Instance.changeMinter(ANTv2MultiMinterInstance.address);
    // One of the minter in multiminters should be ANJNoLockMinter.. For mainnet, there'll be MultiSig too.
    await ANTv2MultiMinterInstance.addMinter(ANJNoLockMinterInstance.address);
    
    // let's generate ANJ so we can test if we can migrate them into ANTv2
    await ANJInstance.generateTokens(deployer, bigExp(1000000, 18));

    // Transfer to someone so he can test on his own address.
    await ANTv1Instance.transfer("0x79BF8bBaC596794f1489e94bF4C15Fbf51EA70B5",  bigExp(70, 18));
    await ANJInstance.transfer("0x79BF8bBaC596794f1489e94bF4C15Fbf51EA70B5", bigExp(50, 18));

    console.log(ANJInstance.address);
    console.log(ANTv1Instance.address);
    console.log(ANTv2Instance.address);
    console.log(ANTv2MigratorInstance.address);
    console.log(ANTv2MultiMinterInstance.address);
    console.log(ANJNoLockMinterInstance.address);

}

module.exports = {
    deployOnTestnet
}
