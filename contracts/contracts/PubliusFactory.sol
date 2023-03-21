// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { BeaconProxy } from "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "./PubliusBeacon.sol";
import "./Publius.sol";

contract PubliusFactory is BeaconProxy {

    mapping(uint256 => address) private publications;

    PubliusBeacon immutable beacon;
    
    constructor(address _beacon) {
        beacon = new PubliusBeacon(_beacon);
    }

    function createPublication(uint256 _id, 
        address _publicationAuthor, 
        string calldata _publicationName, 
        string calldata _publicationCoverImage)
        public {
        require(publications[_id] == address(0), "PubliusFactory: Publication already exists");
        BeaconProxy publication = new BeaconProxy(
            address(beacon), 
            abi.encodeWithSelector(
                Publius.initialize.selector, 
                _id,
                _publicationAuthor, 
                _publicationName, 
                _publicationCoverImage
        ));
        publications[_id] = address(publication);
    }

    function getPublicationAddress(uint256 _id) public view returns (address) {
        return address(publications[_id]);
    }

    function getBeacon() public view returns (address) {
        return address(beacon);
    }

    function getImplementation() public view returns (address) {
        return beacon.publiusImpl();
    }
}
