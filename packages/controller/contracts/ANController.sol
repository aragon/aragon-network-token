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
        minter = _minter;
    }

    function mint(address _owner, uint256 _amount) external onlyMinter returns (bool) {
        return ant.generateTokens(_owner, _amount);
    }

    function changeMinter(address _newMinter) external onlyMinter {
        minter = _newMinter;
        emit ChangedMinter(_newMinter);
    }

    // Default controller settings for allowing token transfers.
    // ANT was compiled with solc 0.4.8, so there is no point in marking any of these functions as `view`.
    function proxyPayment(address /* _owner */) external payable returns (bool) {
      return false;
    }

    /**
    * @dev Callback function called from MiniMe-like instances when an ERC20 transfer is requested
    *      It allows specifying a custom logic to control if a transfer should be allowed or not
    * @return Always true, this controller allows any ERC20 transfer
    */
    function onTransfer(address /* _from */, address /* _to */, uint /* _amount */) external returns (bool) {
      return true;
    }

    /**
    * @dev Callback function called from MiniMe-like instances when an ERC20 approval is requested
    *      It allows specifying a custom logic to control if an approval should be allowed or not
    * @return Always true, this controller allows any ERC20 approval
    */
    function onApprove(address /* _owner */, address /* _spender */, uint /* _amount */) external returns (bool) {
      return true;
    }
}
