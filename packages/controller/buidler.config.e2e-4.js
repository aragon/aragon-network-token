// This buidler configuration is only used to compile the mocks for testing,
// which were deployed on an older solc version (0.4.8)
// Note that this can not be combined with the buidler.config.4.js file, as
// AragonTokenSale.sol and ANT.sol clash
module.exports = {
  solc: {
    version: "0.4.8",
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
  paths: {
    sources: "./e2e/mocks/",
  }
}
