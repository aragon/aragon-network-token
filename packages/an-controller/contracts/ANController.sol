pragma solidity 0.5.17;

import "./interfaces/IMiniMeLike.sol";
import "./interfaces/ITokenController.sol";


contract ANController is ITokenController {
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

    function mintANT(address _owner, uint256 _amount) external onlyMinter returns (bool) {
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

    function onTransfer(address /* _from */, address /* _to */, uint /* _amount */) external returns (bool) {
      return true;
    }

    function onApprove(address /* _owner */, address /* _spender */, uint /* _amount */) external returns (bool) {
      return true;
    }
}
