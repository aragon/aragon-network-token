module.exports = function(error) {
  // Solidity 0.4.8 did not yet have the concept of reverts, so all throws lead to invalid jumps
  assert.isAbove(error.message.search('invalid JUMP'), -1, 'Invalid JUMP error must be returned');
}
