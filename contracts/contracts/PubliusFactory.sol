// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { BeaconProxy } from "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "./PubliusBeacon.sol";
import "./Publius.sol";

contract PubliusFactory {

    mapping(uint256 => address) private publications;

    PubliusBeacon immutable beacon;
    
    constructor(address _publiusImpl) {
        beacon = new PubliusBeacon(_publiusImpl);
    }

    function createPublication(
        uint256 _id, 
        address _publicationAuthorAddress, 
        string calldata _publicationAuthorName,
        string calldata _publicationName, 
        string calldata _publicationCoverImage
    ) public returns (address) {
        require(publications[_id] == address(0), "PubliusFactory: Publication already exists");
        BeaconProxy publication = new BeaconProxy(
            address(beacon), 
            abi.encodeWithSelector(
                Publius(address(0)).initialize.selector,
                _id,
                _publicationAuthorAddress, 
                _publicationAuthorName,
                _publicationName, 
                _publicationCoverImage
        ));
        publications[_id] = address(publication);
        return address(publication);
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
