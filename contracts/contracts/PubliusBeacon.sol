// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { UpgradeableBeacon } from "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract PubliusBeacon is Ownable {

    UpgradeableBeacon immutable beacon;
    
    address public publiusImpl;

    constructor(address _implementation) {
        beacon = new UpgradeableBeacon(_implementation);
        publiusImpl = _implementation;
        transferOwnership(tx.origin);
    }

    function update(address _newImplementation) public onlyOwner {
        beacon.upgradeTo(_newImplementation);
        publiusImpl = _newImplementation;
    }

    function implementation() public view returns (address) {
        return publiusImpl;
    }
}
