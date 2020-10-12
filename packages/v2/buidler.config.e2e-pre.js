// This buidler configuration is only used to run the E2E tests on a ganache-based fork of mainnet.
const { usePlugin } = require('@nomiclabs/buidler/config')
const holders = require('./e2e/holders')
const signers = require('./e2e/signers')

usePlugin("@nomiclabs/buidler-ganache")
usePlugin('@nomiclabs/buidler-truffle5')

// NOTE: USE YOUR OWN (OR AN INFURA) RPC HERE!
const FORK_NODE = process.env.FORK_NODE
if (!FORK_NODE) {
  throw new Error('Please run the e2e test with a `FORK_NODE` environment variable set!')
}

module.exports = {
  networks: {
    // Configuration for Ganache-based fork of mainnet
    ganache: {
      // Mainnet RPC URL
      fork: FORK_NODE,
      // Fork block number (may need to be updated if RPC URL is not an archive node)
      fork_block_number: '11035036',
      // Unlocked accounts that we can "impersonate"
      unlocked_accounts: [...signers, ...holders],

      url: 'http://localhost:8545',
      gasLimit: 6000000,
      defaultBalanceEther: 100,
    },
  },
  solc: {
    version: '0.5.17',
    optimizer: {
      enabled: true,
      runs: 999999,
    },
  },
}
