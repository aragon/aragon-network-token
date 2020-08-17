
pragma solidity ^0.5.0;


/**
 * @dev A sparse MiniMe-like interface containing just `generateTokens()`.
 */
interface IMiniMeLike {
    /**
     * @notice Generates `_amount` tokens that are assigned to `_owner`
     * @param _owner The address that will be assigned the new tokens
     * @param _amount The quantity of tokens generated
     * @return True if the tokens are generated correctly
    */
    function generateTokens(address _owner, uint _amount) external returns (bool);
}
