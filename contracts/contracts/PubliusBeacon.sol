// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import { UpgradeableBeacon } from "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract PubliusBeacon is Ownable {

    // Immutable instance of UpgradeableBeacon contract
    UpgradeableBeacon immutable beacon;

    // Address of current implementation contract
    address public publiusImpl;

    /**
     * @dev Constructor to initialize PubliusBeacon contract
     * @param _implementation Address of initial implementation contract to be used
     */
    constructor(address _implementation) {
        beacon = new UpgradeableBeacon(_implementation);
        publiusImpl = _implementation;
        transferOwnership(tx.origin);
    }

    /**
     * @dev Update implementation contract address
     * @param _newImplementation Address of new implementation contract to be used
     */
    function update(address _newImplementation) public onlyOwner {
        beacon.upgradeTo(_newImplementation);
        publiusImpl = _newImplementation;
    }

    /**
     * @dev Returns the current implementation contract address
     * @return Address of current implementation contract
     */
    function implementation() public view returns (address) {
        return publiusImpl;
    }

}
