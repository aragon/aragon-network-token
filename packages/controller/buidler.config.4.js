// This buidler configuration is only used to compile ANTMock.sol for testing,
// as it relies on an older solc version (0.4.8)
module.exports = {
  solc: {
    version: "0.4.8",
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
  paths: {
    sources: "./mocks/",
  }
}
