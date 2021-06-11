/*
 * SPDX-License-Identifier:    MIT
 */

pragma solidity ^0.5.17;

interface ILockManager {
    /**
    * @dev Tell whether a user can unlock a certain amount of tokens
    */
    function canUnlock(address user, uint256 amount) external view returns (bool);
}