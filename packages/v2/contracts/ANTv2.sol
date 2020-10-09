pragma solidity 0.5.17;

import './interfaces/IERC20.sol';
import './libraries/SafeMath.sol';


// Lightweight token modelled after UNI-LP: https://github.com/Uniswap/uniswap-v2-core/blob/v1.0.1/contracts/UniswapV2ERC20.sol
// Adds:
//   - A minting role
//   - transferWithAuth()
contract ANTv2 is IERC20 {
    using SafeMath for uint256;

    string private constant ERROR_NOT_MINTER = "ANTV2:NOT_MINTER";
    string private constant ERROR_AUTH_EXPIRED = "ANTV2:AUTH_EXPIRED";
    string private constant ERROR_AUTH_NOT_YET_VALID = "ANTV2:AUTH_NOT_YET_VALID";
    string private constant ERROR_AUTH_ALREADY_USED = "ANTV2:AUTH_ALREADY_USED";
    string private constant ERROR_INVALID_SIGNATURE = "ANTV2:INVALID_SIGNATURE";

    string public constant name = "Aragon Network Token";
    string public constant symbol = "ANT";
    uint8 public constant decimals = 18;

    address public minter;
    uint256 public totalSupply;
    mapping (address => uint256) public balanceOf;
    mapping (address => mapping(address => uint256)) public allowance;

    bytes32 public DOMAIN_SEPARATOR;

    // bytes32 public constant PERMIT_TYPEHASH = keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");
    bytes32 public constant PERMIT_TYPEHASH = 0x6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9;
    mapping (address => uint256) public nonces;

    // bytes32 public constant TRANSFER_WITH_AUTHORIZATION_TYPEHASH =
    //     keccak256("TransferWithAuthorization(address from,address to,uint256 value,uint256 validAfter,uint256 validBefore,bytes32 nonce)");
    bytes32 public constant TRANSFER_WITH_AUTHORIZATION_TYPEHASH = 0x7c7c6cdb67a18743f49ec6fa9b35f50d52ed05cbed4cc592e13b44501c1a2267;
    mapping (address => mapping (bytes32 => bool)) public authorizationState;

    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event AuthorizationUsed(address indexed authorizer, bytes32 indexed nonce);
    event ChangeMinter(address indexed minter);

    modifier onlyMinter {
        require(msg.sender == minter, ERROR_NOT_MINTER);
        _;
    }

    constructor(uint256 chainId, address initialMinter) public {
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'),
                keccak256(bytes(name)),
                keccak256(bytes('1')),
                chainId,
                address(this)
            )
        );

        _changeMinter(initialMinter);
    }

    function _validateSignedData(address signer, bytes32 encodeData, uint8 v, bytes32 r, bytes32 s) internal view {
        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                encodeData
            )
        );
        address recoveredAddress = ecrecover(digest, v, r, s);
        require(recoveredAddress != address(0) && recoveredAddress == signer, ERROR_INVALID_SIGNATURE);
    }

    function _changeMinter(address newMinter) internal {
        minter = newMinter;
        emit ChangeMinter(newMinter);
    }

    function _mint(address to, uint256 value) internal {
        totalSupply = totalSupply.add(value);
        balanceOf[to] = balanceOf[to].add(value);
        emit Transfer(address(0), to, value);
    }

    function _approve(address owner, address spender, uint256 value) private {
        allowance[owner][spender] = value;
        emit Approval(owner, spender, value);
    }

    function _transfer(address from, address to, uint256 value) private {
        balanceOf[from] = balanceOf[from].sub(value);
        balanceOf[to] = balanceOf[to].add(value);
        emit Transfer(from, to, value);
    }

    function mint(address to, uint256 value) external onlyMinter returns (bool) {
        _mint(to, value);
        return true;
    }

    function changeMinter(address newMinter) external onlyMinter {
        _changeMinter(newMinter);
    }

    function approve(address spender, uint256 value) external returns (bool) {
        _approve(msg.sender, spender, value);
        return true;
    }

    function transfer(address to, uint256 value) external returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        if (allowance[from][msg.sender] != uint256(-1)) {
            allowance[from][msg.sender] = allowance[from][msg.sender].sub(value);
        }
        _transfer(from, to, value);
        return true;
    }

    function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external {
        require(deadline >= block.timestamp, ERROR_AUTH_EXPIRED);

        bytes32 encodeData = keccak256(abi.encode(PERMIT_TYPEHASH, owner, spender, value, nonces[owner]++, deadline));
        _validateSignedData(owner, encodeData, v, r, s);

        _approve(owner, spender, value);
    }

    function transferWithAuthorization(
        address from,
        address to,
        uint256 value,
        uint256 validAfter,
        uint256 validBefore,
        bytes32 nonce,
        uint8 v,
        bytes32 r,
        bytes32 s
    )
        external
    {
        require(block.timestamp > validAfter, ERROR_AUTH_NOT_YET_VALID);
        require(block.timestamp < validBefore, ERROR_AUTH_EXPIRED);
        require(!authorizationState[from][nonce],  ERROR_AUTH_ALREADY_USED);

        bytes32 encodeData = keccak256(abi.encode(TRANSFER_WITH_AUTHORIZATION_TYPEHASH, from, to, value, validAfter, validBefore, nonce));
        _validateSignedData(from, encodeData, v, r, s);

        authorizationState[from][nonce] = true;
        emit AuthorizationUsed(from, nonce);

        _transfer(from, to, value);
    }
}
