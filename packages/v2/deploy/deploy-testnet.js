const { bigExp } = require('@aragon/contract-helpers-test')

async function deployOnTestnet({ deploy }) {

    const deployer = (await web3.eth.getAccounts())[0];

    // ============== Prepare All Artifacts =====================

    const MiniTokenFactory  = artifacts.require('MiniMeTokenFactory');
    const ANJ               = artifacts.require('ANJ');
    const ANTv1             = artifacts.require('ANT')
    const ANTv2             = artifacts.require('ANTv2')
    const ANTv2MultiMinter  = artifacts.require('ANTv2MultiMinter')
    const ANJNoLockMinter   = artifacts.require('ANJNoLockMinter')
    const ANTv2Migrator     = artifacts.require('ANTv2Migrator');
    

    // ================= DEPLOYMENTS ==============================

    const MiniTokenFactoryInstance  = await MiniTokenFactory.new();
    const ANJInstance               = await ANJ.new(MiniTokenFactoryInstance.address);
    const ANTv1Instance             = await ANTv1.new(MiniTokenFactoryInstance.address);

    const ANTv2Instance             = await ANTv2.new(deployer); // deployer parameter will be the only one that can mint tokens or change the minter.
    const ANTv2MultiMinterInstance  = await ANTv2MultiMinter.new(deployer, ANTv2Instance.address); // deployer parameter will be the one that can call add/remove/changeMinter.
    const ANJNoLockMinterInstance   = await ANJNoLockMinter.new(ANTv2MultiMinterInstance.address, ANTv2Instance.address, ANJInstance.address);
    const ANTv2MigratorInstance     = await ANTv2Migrator.new(deployer, ANTv1Instance.address, ANTv2Instance.address); // deployer parameter will be the only one that can call `initiate` that mints the same amount of ANTv2 as ANTv1.

    // =============================================================

    // const MiniTokenFactoryInstance  = await MiniTokenFactory.new();
    // const ANJInstance               = await ANJ.at("0x96286BbCac30Cef8dCB99593d0e28Fabe95F3572");
    // const ANTv1Instance             = await ANTv1.at("0x59f24735b61e6ef7E5A52F5F7bB708D1c0141C5A");

    // const ANTv2Instance             = await ANTv2.at("0xf0f8D83CdaB2F9514bEf0319F1b434267be36B5c"); 
    // const ANTv2MultiMinterInstance  = await ANTv2MultiMinter.at("0xF64bf861b8A85927FAdd9724E80C2987f82a9259")
    // const ANJNoLockMinterInstance   = await ANJNoLockMinter.at("0xEE25745890bc04bCF926436Ef3Ce490089d89F05")
    // const ANTv2MigratorInstance     = await ANTv2Migrator.at("0xF45C53D13bF1F5f757E3331e258589a6f30e662F")


    // =============================================================

    // ==================== SET INITIAL STATE ==========================

    // This makes sure for the ANTv1/ANTv2  ANTv2Migrator to be able to mint AntV2 tokens
    // from the initiate function, so that when the user wants to migrate, we can
    // transfer created ANTv2 from ANTv2Migrator to his ANTv2 address.
    await ANTv2Instance.changeMinter(ANTv2MigratorInstance.address);
    await ANTv1Instance.generateTokens(deployer, bigExp(1000000, 18));
    // This mints the same amount of ANTv2 as ANTv1. and changes the minter of the ANTv2 back to the owner..(whatever it was before we called changeMinter)
    await ANTv2MigratorInstance.initiate();

    // MultiMinter is the only one that should be able to mint on the ANTv2 instance.
    await ANTv2Instance.changeMinter(ANTv2MultiMinterInstance.address);
    // One of the minter in multiminters should be ANJNoLockMinter.. For mainnet, there'll be MultiSig too.
    await ANTv2MultiMinterInstance.addMinter(ANJNoLockMinterInstance.address);
    
    // let's generate ANJ so we can test if we can migrate them into ANTv2
    await ANJInstance.generateTokens(deployer, bigExp(1000000, 18));

    // Transfer to someone so he can test on his own address.
    await ANTv1Instance.transfer("0x79BF8bBaC596794f1489e94bF4C15Fbf51EA70B5",  bigExp(70, 18));
    await ANJInstance.transfer("0x79BF8bBaC596794f1489e94bF4C15Fbf51EA70B5", bigExp(50, 18));

    // const balance2 = await ANTv2Instance.balanceOf(deployer);
    // console.log("ANT balance ",   web3.utils.fromWei(balance2.toString(), "ether"));

    // This is just here for the testing purpose. This is the exact call that front-end calls
    // when it needs to migrate ANTv1 to ANTv2.
    // await ANTv1Instance.approveAndCall(ANTv2MigratorInstance.address, bigExp(10, 18), '0x');

    // This is just here for the testing purpose. This is the exact call that front-end calls
    // when it needs to migrate ANJ to ANTv2.
    // await ANJInstance.approveAndCall(ANJNoLockMinterInstance.address, bigExp(10, 18), "0x");

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
