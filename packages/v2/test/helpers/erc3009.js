const abi = require('web3-eth-abi')
const { keccak256, soliditySha3 } = require('web3-utils')

const TRANSFER_WITH_AUTHORIZATION_TYPEHASH = keccak256('TransferWithAuthorization(address from,address to,uint256 value,uint256 validAfter,uint256 validBefore,bytes32 nonce)')

async function createTransferWithAuthorizationDigest(token, from, to, value, validAfter, validBefore, nonce) {
  const chainId = await token.getChainId();
  const name = await token.name();
  const domainSeparator = keccak256(
    abi.encodeParameters(
      ["bytes32", "bytes32", "bytes32", "uint256", "address"],
      [
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
        keccak256(name),
        keccak256("1"),
        chainId,
        token.address,
      ]
    )
  );

  // Tightly pack with soliditySha3
  return soliditySha3(
    { type: 'bytes1', value: '0x19' },
    { type: 'bytes1', value: '0x01' },
    { type: 'bytes32', value: domainSeparator },
    { type: 'bytes32', value:
        keccak256(
          abi.encodeParameters(
            ['bytes32', 'address', 'address', 'uint256', 'uint256', 'uint256', 'bytes32'],
            [TRANSFER_WITH_AUTHORIZATION_TYPEHASH, from, to, value, validAfter, validBefore, nonce]
          )
        )
    }
  )
}

module.exports = {
  createTransferWithAuthorizationDigest,
  TRANSFER_WITH_AUTHORIZATION_TYPEHASH
}
