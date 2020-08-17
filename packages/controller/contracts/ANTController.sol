pragma solidity 0.5.17;

import "./interfaces/IMiniMeLike.sol";
import "./interfaces/ITokenController.sol";


contract ANTController is ITokenController {
    string private constant ERROR_NOT_MINTER = "ANC_SENDER_NOT_MINTER";

    IMiniMeLike public ant;
    address public minter;

    event ChangedMinter(address indexed minter);

    /**
    * @dev Ensure the msg.sender is the minter
    */
    modifier onlyMinter {
        require(msg.sender == minter, ERROR_NOT_MINTER);
        _;
    }

    constructor(IMiniMeLike _ant, address _minter) public {
        ant = _ant;
        _changeMinter(_minter);
    }

    /**
    * @notice Mint ANT for a specified address
    * @dev Note that failure to generate the requested tokens will result in a revert
    * @param _receiver Address to receive minted ANT
    * @param _amount Amount to mint
    * @return True if the tokens are generated correctly
    */
    function mint(address _receiver, uint256 _amount) external onlyMinter returns (bool) {
        return ant.generateTokens(_receiver, _amount);
    }

    /**
    * @notice Change the permitted minter to another address
    * @param _newMinter Address that will be permitted to mint ANT
    */
    function changeMinter(address _newMinter) external onlyMinter {
        _changeMinter(_newMinter);
    }

    // Default ITokenController settings for allowing token transfers.
    // ANT was compiled with solc 0.4.8, so there is no point in marking any of these functions as `view`:
    //   - The original interface does not specify these as `constant`
    //   - ANT does not use a `staticcall` when calling into these functions

    /**
    * @dev Callback function called from MiniMe-like instances when ETH is sent into the token contract
    *      It allows specifying a custom logic to control if the ETH should be accepted or not
    * @return Always false, this controller does not permit the ANT contract to receive ETH transfers
    */
    function proxyPayment(address /* _owner */) external payable returns (bool) {
      return false;
    }

    /**
    * @dev Callback function called from MiniMe-like instances when an ERC20 transfer is requested
    *      It allows specifying a custom logic to control if a transfer should be allowed or not
    * @return Always true, this controller allows all transfers
    */
    function onTransfer(address /* _from */, address /* _to */, uint /* _amount */) external returns (bool) {
      return true;
    }

    /**
    * @dev Callback function called from MiniMe-like instances when an ERC20 approval is requested
    *      It allows specifying a custom logic to control if an approval should be allowed or not
    * @return Always true, this controller allows all approvals
    */
    function onApprove(address /* _owner */, address /* _spender */, uint /* _amount */) external returns (bool) {
      return true;
    }

    // Internal fns

    function _changeMinter(address _newMinter) internal {
        minter = _newMinter;
        emit ChangedMinter(_newMinter);
    }
}
