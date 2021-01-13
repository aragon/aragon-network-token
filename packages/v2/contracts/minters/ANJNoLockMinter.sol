pragma solidity 0.5.17;

import '../interfaces/ApproveAndCallReceiver.sol';
import '../interfaces/IERC20.sol';
import '../ANTv2MultiMinter.sol';


contract ANJNoLockMinter is ApproveAndCallReceiver {
    string private constant ERROR_WRONG_TOKEN = "ANJ_NO_LCK_MNTR:WRONG_TOKEN";
    string private constant ERROR_ZERO_AMOUNT = "ANJ_NO_LCK_MNTR:ZERO_AMOUNT";
    string private constant ERROR_TRANSFER_FAILED = "ANJ_NO_LCK_MNTR:TRANSFER_FAIL";
    string private constant ERROR_MINT_FAILED = "ANJ_NO_LCK_MNTR:MINT_FAILED";

    address private constant BURNED_ADDR = 0x000000000000000000000000000000000000dEaD;
    
    // Exchange rate is 0.015 ANT per ANJ
    uint256 private constant RATE = 15 * 10 ** 15;
    uint256 private constant RATE_BASE = 10 ** 18;

    ANTv2MultiMinter public minter;
    ANTv2 public ant;
    IERC20 public anj;

    constructor(ANTv2MultiMinter _minter, ANTv2 _ant, IERC20 _anj) public {
        minter = _minter;
        ant = _ant;
        anj = _anj;
    }

    function migrate(uint256 _amount) external {
        _migrate(msg.sender, _amount);
    }

    function migrateAll() external {
        uint256 amount = anj.balanceOf(msg.sender);
        _migrate(msg.sender, amount);
    }

    function receiveApproval(address _from, uint256 _amount, address _token, bytes calldata /*_data*/) external {
        require(_token == msg.sender && _token == address(anj), ERROR_WRONG_TOKEN);

        uint256 fromBalance = anj.balanceOf(_from);
        uint256 migrationAmount = _amount > fromBalance ? fromBalance : _amount;

        _migrate(_from, migrationAmount);
    }

    function _migrate(address _from, uint256 _amount) private {
        require(_amount > 0, ERROR_ZERO_AMOUNT);

        // Burn ANJ
        require(anj.transferFrom(_from, BURNED_ADDR, _amount), ERROR_TRANSFER_FAILED);
        // Mint ANT
        uint256 antAmount = _amount * RATE / RATE_BASE;
        require(minter.mint(_from, antAmount), ERROR_MINT_FAILED);
    }
}
