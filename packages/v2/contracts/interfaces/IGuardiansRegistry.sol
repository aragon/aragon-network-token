/*
 * SPDX-License-Identifier:    MIT
 */

pragma solidity ^0.5.17;

interface IGuardiansRegistry {

    /**
    * @dev This allows users or managers to stake and activate coins on the GuardiansRegistry
    * @param _guardian Address of the guardian staking and activating tokens for
    * @param _amount Amount of tokens to be staked and activated
    */
    function stakeAndActivate(address _guardian, uint256 _amount) external;

    /**
    * @dev This allows users to lock the active tokens.
    * @param _guardian Address of the guardian locking the activation for
    * @param _lockManager Address of the lock manager that will control the lock
    * @param _amount Amount of active tokens to be locked
    */
    function lockActivation(address _guardian, address _lockManager, uint256 _amount) external;

}
