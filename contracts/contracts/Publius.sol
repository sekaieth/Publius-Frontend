// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { ERC721Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract Publius is ERC721Upgradeable, Initializable {
	
	// GLOBAL STATE
	
	mapping(uint256 => address) public tokenIdToMinter;
	mapping(address => uint256[]) public minterOwnedTokens;

	struct Book {
		string name;
		string author;
		string coverImage;
		mapping(Section => Chapter[] public sectionChapters;
		mapping(Chapter => Page[]) public chapterPages;
	}

	struct Section {
		string name;
		uint256 id;
		mapping(Chapter => Page[]) public 
	}

	struct Chapter {
		string name;
		uint256 id;
		Page[] public pages;
	}



	function initialize(string _publicationName, address _author) public Initializer {
	
	}

	function addChapter(uint256 _section) {

	}

	function addPage(uint256 _section, uint256 _chapter) {
	
	}

	function tokenURI(uint256 _tokenId) public returns (string uri) {

	}
	
	function getChapter


}
