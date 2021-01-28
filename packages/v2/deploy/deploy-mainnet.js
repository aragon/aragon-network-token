
async function deployOnMainnet({ deploy }) {

    const ANJAddress        = "0xcD62b1C403fa761BAadFC74C525ce2B51780b184";
    const ANTv2Address      = "0xa117000000f279D81A1D3cc75430fAA017FA5A2e";
    const MultiSigAddress   = "0xbEEFbEeF03c7E5a1C29E0Aa675f8E16AEe0A5FAd";
  
    const ANTv2MultiMinter  = artifacts.require('ANTv2MultiMinter')
    const ANJNoLockMinter   = artifacts.require('ANJNoLockMinter')
    const ANTv2             = artifacts.require('ANTv2')
    const MultiSig          = artifacts.require('MultisigWallet');


    const ANTv2MultiMinterInstance  = await ANTv2MultiMinter.new("0xbEEFbEeF03c7E5a1C29E0Aa675f8E16AEe0A5FAd", ANTv2Address);
    const ANJNoLockMinterInstance   = await ANJNoLockMinter.new(ANTv2MultiMinterInstance.address, ANTv2Address, ANJAddress);

    // This can be done only by the owner that we passed when creating ANTv2MultiMinter. Can be changed by changeMinter...
    await ANTv2MultiMinterInstance.addMinter(ANJNoLockMinterInstance.address);

    // MultiMinter is the only one that should be able to mint on the ANTv2 instance, BUT
    // This won't work because the only MultiSig can change the Minter on ANTv2.
    // The only way to do this is to create a transaction into multisig contract and after having voted on it enough,
    // then it will make this transaction.
    // await ANTv2Instance.changeMinter(ANTv2MultiMinterInstance.address);


    await ANTv2MultiMinterInstance.addMinter(MultiSigAddress);


}   


module.exports = {
    deployOnMainnet
}