//SPDX-Indentifier: UNLICENSED;
pragma solidity 0.8.15;

import { ERC721Upgradeable } "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializeable.sol";

contract Publius is ERC721Upgradeable, Initializable {
	
	// GLOBAL STATE
	
	mapping(uint256 => address) public tokenIdToMinter;
	mapping(address => uint256[]) public minterOwnedTokens;

	struct Book {
		Chapter[] chapters;


	function initialize(string _publicationName, address _author) public Initializer {
	
	}

	function tokenURI(uint256 _tokenId) public returns (string uri) {

	}



