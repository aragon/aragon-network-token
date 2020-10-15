pragma solidity 0.5.17;

import './interfaces/IERC20.sol';
import './ANTv2Migrator.sol';


contract EscrowANTv2Migrator {
    string private constant ERROR_NOT_ALLOWED = "ESCROW_MIG:NOT_ALLOWED";
    string private constant ERROR_NO_BALANCE = "ESCROW_MIG:NO_BALANCE";
    string private constant ERROR_MIGRATION_FAILED = "ESCROW_MIG:MIGRATION_FAILED";

    IERC20 public constant antv1 = IERC20(0x960b236A07cf122663c4303350609A66A7B288C0);
    IERC20 public constant antv2 = IERC20(0xa117000000f279D81A1D3cc75430fAA017FA5A2e);
    ANTv2Migrator public constant antv2Migrator = ANTv2Migrator(0x078BEbC744B819657e1927bF41aB8C74cBBF912D);

    address public recipient;
    address public initiator;

    /**
    * @param _recipient Recipient of the migrated ANTv2 tokens
    * @param _initiator Account that can initiate the migration of ANTv1 held in this contract
    */
    constructor(address _recipient, address _initiator) public {
        recipient = _recipient;
        initiator = _initiator;
    }

    /**
    * @notice Migrate ANTv1 balance held by this contract into ANTv2 and transfer to recipient
    */
    function migrate() external {
        require(msg.sender == initiator || initiator == address(0), ERROR_NOT_ALLOWED);

        uint256 balance = antv1.balanceOf(address(this));
        require(balance > 0, ERROR_NO_BALANCE);

        // Approve migrator, migrate ANTv2 into here, and transfer ANTv2 to recipient
        require(antv1.approve(address(antv2Migrator), balance), ERROR_MIGRATION_FAILED);
        antv2Migrator.migrate(balance);
        require(antv2.transfer(recipient, balance), ERROR_MIGRATION_FAILED);
    }
}
