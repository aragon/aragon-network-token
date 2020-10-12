const rlp = require('rlp')
const { keccak256 } = require('web3-utils')

function calculateContractAddress(from, nonce) {
  let encodedNonce

  if (nonce === 0) {
    encodedNonce = `0x`
  } else {
    const hexNonce = nonce.toString('16')
    const hexLength = (hexNonce.length + 1) % 2 ? hexNonce.length + 1 : hexNonce.length
    encodedNonce = `0x${hexNonce.padStart(hexLength, '0')}`
  }

  // address = sha3(rlp_encode(creator_account, creator_account_nonce))[12:]
  const rlpEncoded = `0x${rlp.encode([from, encodedNonce]).toString('hex')}`
  return `0x${keccak256(rlpEncoded).substr(-40)}`
}

module.exports = {
  calculateContractAddress,
}
