const {
  assertRevert: assertRevertHelper,
} = require("@aragon/contract-helpers-test/src/asserts");

// this ctx will prevent the underlying library from doing
// special geth node assert message processing
const ctx = {
  web3: {
    eth: {
      getNodeInfo: () => [],
    },
  },
};

const assertRevert = (blockOrPromise, expectedReason) =>
  assertRevertHelper(blockOrPromise, expectedReason, ctx);

module.exports = {
  assertRevert,
};
