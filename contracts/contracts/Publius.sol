// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

import { ERC721Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { BeaconProxy } from "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";

contract Publius is ERC721Upgradeable, Initializable, OwnableUpgradeable {
	
	// GLOBAL STATE

	// @dev Track ho owns what token ID
	mapping(uint256 => address) public tokenIdToMinter;
	// @dev Track how many tokens each minter has minted
	mapping(address => uint256[]) public minterOwnedTokens;

	// @dev Publication section storage
	Section[] public sections;
	
	string public publicationName;
	string public publicationAuthor;
	string public publicationCoverImage;

	struct Section {
		string sectionName;
		uint256 sectionId;
		string sectionImage;
		Chapter[] chapters;
	}
	
	struct Chapter {
		string chapterName;
		uint256 chapterId;
		string chapterImage;
		Page[] pages;
	}

	struct Page {
		string pageName;
		uint256 pageId;
		bytes32[] pageContent;
	}


	/*
	* @dev Initialize the contract
	* @param _publicationName The name of the publication
	* @param _author The author of the publication
	* @param _publicationCoverImage The cover image of the publication
	*/
	function initialize(address _author, address _author, string _publicationCoverImage) public Initializer {
		require(keccak256(abi.encode(publicationAuther)) != "", "Cannot Initialize more than once");
		publicationName = _publicationName;
		publicationAuther = _author;
		publicationCoverImage = _publicationCoverImage;

	}

	/*
	* @dev Add a new chapter to the publication
	* @dev _chapterImage is optional - just use an empty string if you don't want to add an image
	* @param _sectionName The name of the section
	* @param _chapterImage The image of the section
	*/
	function addChapter(uint256 _section, string _chapterName, string _chapterImage, string _pageName, uint256 _pageId, string[] _pageContent) {
		Section chapterSection = sections[_sections - 1];

		Page newPage = {
			pageName = _pageName;
			pageId = _pageId;
			pageContent = bytes32(_pageContent);
		}

		Chapter newChapter = {
			chapterName = _chapterName;
			chapterId = chapterSection.chapters.length + 1;
			// Check if _chapterImage is not an empty string then set sectionImage to _chapterImage
			if (keccak256(abi.encode(_chapterImage)) != "") {
				chapterImage = _chapterImage;
			}
			
			chapterSection.chapters.push(newChapter);
		}
	}

	/*
	* @dev Add a new page to the publication
	* @param _section The section the page belongs to
	* @param _chapter The chapter the page belongs to
	*/
	function addPage(uint256 _section, uint256 _chapter, string _pageName, string[] _pageContent) {
		Page newPage = {
			pageName = _pageName;
			pageId = chapterSection.chapters[_chapter].pages.length + 1;
			pageContent = _pageContent;
			pageContent = bytes32(_pageContent);
		}
	}

	function tokenURI(uint256 _tokenId) public returns (string uri) {

	}
	

}
