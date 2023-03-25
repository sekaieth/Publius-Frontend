// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import { BeaconProxy } from "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "./PubliusBeacon.sol";
import "./Publius.sol";

/**
 * @title PubliusFactory
 * @dev This contract is used to create new instances of the Publius contract.
 */
contract PubliusFactory {
    // Mapping to store the contract address of each publication
    mapping(uint256 => address) private publications;
    // Counter for the number of publications
    uint256 public publicationCount;
    // Beacon contract for Publius
    PubliusBeacon immutable beacon;

    // Event emitted when a the Beacon is deployed in the constructor
    event BeaconDeployed (
        address beaconAddress
    );
    // Event emitted when a new publication is created
    event PublicationCreated (
        uint256 id,
        address publicationAddress
    );

    /**
     * @dev Constructor for PubliusFactory
     * @param _publiusImpl The address of the initial implementation contract for Publius
     */
    constructor(address _publiusImpl) {
        beacon = new PubliusBeacon(_publiusImpl);
        emit BeaconDeployed(address(beacon));
    }

    /**
     * @dev Creates a new instance of the Publius contract using a BeaconProxy
     * @param _id The unique ID for the new publication
     * @param _publicationAuthorAddress The address of the publication's author
     * @param _publicationAuthorName The name of the publication's author
     * @param _publicationName The name of the new publication
     * @param _publicationCoverImage The IPFS hash of the cover image for the new publication
     * @param _costToMint The cost in wei to mint a new page for the publication
     * @return The address of the new publication contract
     */
    function createPublication(
        uint256 _id, 
        address _publicationAuthorAddress, 
        string calldata _publicationAuthorName,
        string calldata _publicationName, 
        string calldata _publicationCoverImage,
        uint256 _costToMint
    ) public returns (address) {
        // Check that the publication ID has not been used already
        require(publications[_id] == address(0), "PubliusFactory: Publication already exists");
        // Deploy a new Publius contract using the implementation beacon
        BeaconProxy publication = new BeaconProxy(
            address(beacon), 
            abi.encodeWithSelector(
                Publius(address(0)).initialize.selector,
                _id,
                _publicationAuthorAddress, 
                _publicationAuthorName,
                _publicationName, 
                _publicationCoverImage,
                _costToMint
        ));
        // Store the contract address of the new publication
        publications[_id] = address(publication);
        publicationCount++;
        // Emit an event for the new publication
        emit PublicationCreated(_id, address(publication));
        return address(publication);
    }

    /**
     * @dev Returns the contract address of a specific publication
     * @param _id The ID of the publication to look up
     * @return The contract address of the publication with the given ID
     */
    function getPublicationAddress(uint256 _id) public view returns (address) {
        return address(publications[_id]);
    }

    /**
     * @dev Returns the contract address of the implementation beacon used for Publius
     * @return The address of the implementation beacon
     */
    function getBeacon() public view returns (address) {
        return address(beacon);
    }

    /**
    @dev Returns the address of the implementation contract that the PubliusBeacon contract is pointing to.
    @return The address of the implementation contract.
    */
    function getImplementation() public view returns (address) {
        return beacon.publiusImpl();
    }

}
