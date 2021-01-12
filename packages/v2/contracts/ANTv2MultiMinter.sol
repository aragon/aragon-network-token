pragma solidity 0.5.17;

import './ANTv2.sol';


contract ANTv2MultiMinter {
    string private constant ERROR_NOT_OWNER = "ANTV2_MM:NOT_OWNER";
    string private constant ERROR_NOT_MINTER = "ANTV2_MM:NOT_MINTER";

    address public owner;
    ANTv2 public ant;

    mapping (address => bool) public canMint;

    event AddedMinter(address indexed minter);
    event RemovedMinter(address indexed minter);
    event ChangedOwner(address indexed newOwner);

    modifier onlyOwner {
        require(msg.sender == owner, ERROR_NOT_OWNER);
        _;
    }

    modifier onlyMinter {
        require(canMint[msg.sender] || msg.sender == owner, ERROR_NOT_MINTER);
        _;
    }

    constructor(address _owner, ANTv2 _ant) public {
        owner = _owner;
        ant = _ant;
    }

    function mint(address to, uint256 value) external onlyMinter returns (bool) {
        return ant.mint(to, value);
    }

    function addMinter(address minter) external onlyOwner {
        canMint[minter] = true;

        emit AddedMinter(minter);
    }

    function removeMinter(address minter) external onlyOwner {
        canMint[minter] = false;

        emit RemovedMinter(minter);
    }

    function changeMinter(address newMinter) onlyOwner external {
        ant.changeMinter(newMinter);
    }

    function changeOwner(address newOwner) onlyOwner external {
        _changeOwner(newOwner);
    }

    function _changeOwner(address newOwner) internal {
        owner = newOwner;
        
        emit ChangedOwner(newOwner);
    }
}
