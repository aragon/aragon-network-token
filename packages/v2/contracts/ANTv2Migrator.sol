pragma solidity 0.5.17;

import './interfaces/ApproveAndCallReceiver.sol';
import './interfaces/IERC20.sol';
import './ANTv2.sol';


contract ANTv2Migrator is ApproveAndCallReceiver {
    string private constant ERROR_NOT_INITATOR = "ANTV2_MIG:NOT_INITIATOR";
    string private constant ERROR_WRONG_TOKEN = "ANTV2_MIG:WRONG_TOKEN";
    string private constant ERROR_ZERO_AMOUNT = "ANTV2_MIG:ZERO_AMOUNT";
    string private constant ERROR_TRANSFER_FAILED = "ANTV2_MIG:TRANSFER_FAIL";

    address private constant BURNED_ADDR = 0x000000000000000000000000000000000000dEaD;

    address owner;
    IERC20 antv1;
    ANTv2 antv2;

    constructor(address _owner, IERC20 _antv1, ANTv2 _antv2) public {
        owner = _owner;
        antv1 = _antv1;
        antv2 = _antv2;
    }

    function initiate() external {
        require(msg.sender == owner, ERROR_NOT_INITATOR);

        // Mint an equal supply of ANTv2 as ANTv1 to this migration contract
        uint256 antv1Supply = antv1.totalSupply();
        antv2.mint(address(this), antv1Supply);

        // Transfer ANTv2 minting role to owner
        antv2.changeMinter(owner);
    }

    function migrate(uint256 _amount) external {
        _migrate(msg.sender, _amount);
    }

    function migrateAll() external {
        uint256 amount = antv1.balanceOf(msg.sender);
        _migrate(msg.sender, amount);
    }

    function receiveApproval(address _from, uint256 _amount, address _token, bytes calldata /*_data*/) external {
        require(_token == msg.sender && _token == address(antv1), ERROR_WRONG_TOKEN);

        uint256 fromBalance = antv1.balanceOf(_from);
        uint256 migrationAmount = _amount > fromBalance ? fromBalance : _amount;

        _migrate(_from, migrationAmount);
    }

    function _migrate(address _from, uint256 _amount) private {
        require(_amount > 0, ERROR_ZERO_AMOUNT);

        // Burn ANTv1
        require(antv1.transferFrom(_from, BURNED_ADDR, _amount), ERROR_TRANSFER_FAILED);
        // Return ANTv2
        require(antv2.transfer(_from, _amount), ERROR_TRANSFER_FAILED);
    }
}
