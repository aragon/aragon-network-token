const { types, usePlugin } = require('@nomiclabs/buidler/config')
const { deploy } = require('./buidler/cli')
const { deployOnTestnet } = require('./deploy/deploy-testnet')
const { deployOnMainnet } = require('./deploy/deploy-mainnet')


usePlugin("@nomiclabs/buidler-ganache")
usePlugin('@nomiclabs/buidler-truffle5')
usePlugin('buidler-local-networks-config-plugin')

task('deploy', 'Deploy ANTv2 and migrator')
  .addParam('owner', "The migrator's owner")
  .addOptionalParam('antv1', 'The ANTv1 address to use', '0x960b236A07cf122663c4303350609A66A7B288C0')
  .setAction(deploy)


task('deploy-testnet', 'This deploys the following contracts(ANJ, ANTv1, ANTv2, ANTv2Migrator, ANJNoLockMinter, ANTv2MultiMinter.sol')
  .setAction(deployOnTestnet)

task('deploy-mainnet', 'This deploys the following contracts(ANJNoLockMinter, ANTv2MultiMinter.sol')
  .setAction(deployOnMainnet)


const PRIVATE_KEY =  "";

module.exports = {
  networks: {
    // Local development network using ganache. You can set any of the
    // Ganache's options. All of them are supported, with the exception
    // of accounts.
    // https://github.com/trufflesuite/ganache-core#options
    ganache: {
      url: 'http://localhost:7545',
      gasLimit: 6000000000,
      defaultBalanceEther: 100
    },
    // Mainnet network configured with Aragon node.
    mainnet: {
      url: 'https://mainnet.infura.io/v3/7a03fcb37be7479da06f92c5117afd47',
      accounts: [`0x${PRIVATE_KEY}`]
    },
    // Rinkeby network configured with Aragon node.
    rinkeby: {
      url: 'https://rinkeby.infura.io/v3/7a03fcb37be7479da06f92c5117afd47',
      accounts: [`0x${PRIVATE_KEY}`],
    },
    // Network configured to interact with Frame wallet. Requires
    // to have Frame running on your machine. Download it from:
    // https://frame.sh
    frame: {
      httpHeaders: { origin: 'buidler' },
      url: 'http://localhost:1248',
    }
  },
  solc: {
    version: '0.5.17',
    optimizer: {
      enabled: true,
      runs: 999999,
    },
  },
}
