const { usePlugin } = require('@nomiclabs/buidler/config')

usePlugin("@nomiclabs/buidler-ganache")
usePlugin('@nomiclabs/buidler-truffle5')

const ACCOUNTS = (process.env.ETH_KEYS ? process.env.ETH_KEYS.split(',') : [])
  .map(key => key.trim())

module.exports = {
  networks: {
    // Local development network using ganache. You can set any of the
    // Ganache's options. All of them are supported, with the exception
    // of accounts.
    // https://github.com/trufflesuite/ganache-core#options
    ganache: {
      url: 'http://localhost:8545',
      gasLimit: 6000000000,
      defaultBalanceEther: 100
    },
    // Mainnet network configured with Aragon node.
    mainnet: {
      url: 'https://mainnet.eth.aragon.network',
      accounts: ACCOUNTS,
    },
    // Rinkeby network configured with Aragon node.
    rinkeby: {
      url: 'https://rinkeby.eth.aragon.network',
      accounts: ACCOUNTS,
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
      runs: 10000,
    },
  },
}
