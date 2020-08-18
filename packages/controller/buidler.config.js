const { usePlugin } = require('@nomiclabs/buidler/config')

usePlugin("@nomiclabs/buidler-ganache")
usePlugin('@nomiclabs/buidler-truffle5')

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
      accounts: [
        process.env.ETH_KEY ||
          '0xa8a54b2d8197bc0b19bb8a084031be71835580a01e70a45a13babd16c9bc1563',
      ],
    },
    // Rinkeby network configured with Aragon node.
    rinkeby: {
      url: 'https://rinkeby.eth.aragon.network',
      accounts: [
        process.env.ETH_KEY ||
          '0xa8a54b2d8197bc0b19bb8a084031be71835580a01e70a45a13babd16c9bc1563',
      ],
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
