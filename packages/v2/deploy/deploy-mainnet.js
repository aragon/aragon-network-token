
async function deployOnMainnet({ deploy }) {

    const deployer = (await web3.eth.getAccounts())[0];

    const ANTv2MultiMinter  = artifacts.require('ANTv2MultiMinter')
    const ANJNoLockMinter   = artifacts.require('ANJNoLockMinter')
    const ANTv2             = artifacts.require('ANTv2')
    const MultiSig          = artifacts.require('MultisigWallet');

    const ANJAddress        = "0xcD62b1C403fa761BAadFC74C525ce2B51780b184";
    const ANTv2Address      = "0xa117000000f279D81A1D3cc75430fAA017FA5A2e";
    const MultiSigAddress   = "0xbEEFbEeF03c7E5a1C29E0Aa675f8E16AEe0A5FAd";
    
    const MultiSigInstance          = await MultiSig.at(MultiSigAddress);
    const ANTv2Instance             = await ANTv2.at(ANTv2Address);

    const ANTv2MultiMinterInstance  = await ANTv2MultiMinter.new(deployer, ANTv2Address);
    const ANJNoLockMinterInstance   = await ANJNoLockMinter.new(ANTv2MultiMinterInstance.address, ANTv2Address, ANJAddress);

    // This can be done only by the owner that we passed when creating ANTv2MultiMinter. Can be changed by changeOwner...
    await ANTv2MultiMinterInstance.addMinter(ANJNoLockMinterInstance.address);

    // This will not work from the current deployer, This action can be only done by one of the owners from multisig.
    // const changeMinterData = ANTv2Instance.contract.methods.changeMinter(ANTv2MultiMinterInstance.address).encodeABI();
    // await MultiSigInstance.submitTransaction(ANTv2Address, 0, changeMinterData);

    await ANTv2MultiMinterInstance.changeOwner(MultiSigAddress);

    console.log(ANTv2MultiMinterInstance.address, " ANTv2 MultiMinter");
    console.log(ANJNoLockMinterInstance.address, " ANJNoLockMinter");

}   


module.exports = {
    deployOnMainnet
}