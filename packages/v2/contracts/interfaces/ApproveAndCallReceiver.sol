pragma solidity ^0.5.17;


interface ApproveAndCallReceiver {
    /**
    * @dev This allows users to use their tokens to interact with contracts in one function call instead of two
    * @param _from Address of the account transferring the tokens
    * @param _amount The amount of tokens approved for in the transfer
    * @param _token Address of the token contract calling this function
    * @param _data Optional data that can be used to add signalling information in more complex staking applications
    */
    function receiveApproval(address _from, uint256 _amount, address _token, bytes calldata _data) external;
}
