// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import { ERC721Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { BeaconProxy } from "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";

contract Publius is 
	Initializable, 
	ERC721Upgradeable, 
	OwnableUpgradeable {
	
	// GLOBAL STATE

	// @dev Track ho owns what token ID
	mapping(uint256 => address) public tokenIdToMinter;
	// @dev Track how many tokens each minter has minted
	mapping(address => uint256[]) public minterOwnedTokens;
	// @dev Publication section storage
	mapping(uint256 => Section) public sections;

	string public publicationName;
	address public publicationAuthor;
	string public publicationCoverImage;

	struct Section {
		string sectionName;
		uint256 sectionId;
		string sectionImage;
		mapping(uint256 => Chapter) chapters;
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
		string pageContent;
	}

	/*
	* @dev Initialize the contract
	* @param _publicationName The name of the publication
	* @param _author The author of the publication
	* @param _publicationCoverImage The cover image of the publication
	*/
	function initialize(address _publicationAuthor, string calldata _publicationName, string calldata _publicationCoverImage) public initializer {
		require(keccak256(abi.encode(publicationAuthor)) != "", "Cannot Initialize more than once");
		__ERC721_init(_publicationName, "PUBLIUS");
		__Ownable_init();
		transferOwnership(_publicationAuthor);
		publicationName = _publicationName;
		publicationAuthor = _publicationAuthor;
		publicationCoverImage = _publicationCoverImage;

	}

	// Add section with all chapter and page data
	function addSection(string calldata _sectionName, uint256 _sectionId, string calldata _sectionImage, string[] calldata _chapterNames, string[] calldata _chapterImages, uint256[] calldata _chapterIds, string[] calldata _pageNames, string[] calldata _pageContent) public onlyOwner {
		// Load new section
		Section storage section = sections[_sectionId];


		// Load each chapter with pages
		for (uint256 i = 0; i < _chapterNames.length; i++) {
			Page[] storage pages = section.chapters[_chapterIds[i]].pages;
			// Loop through pages and add to chapter
			for (uint256 j = 0; j < _pageNames.length; j++) {
				pages[j] = Page(
					_pageNames[j],
					j + 1,
					_pageContent[j]
				);
			}
			section.chapters[_chapterIds[i]] = Chapter(
				{
				chapterName: _chapterNames[i],
				chapterId: _chapterIds[i],
				// Check if _chapterImage is not an empty string calldata then set sectionImage to _chapterImage
				chapterImage: keccak256(abi.encode(_chapterImages[i])) != "" ?  _chapterImages[i] : "",
				pages: pages
				}
			);
		}

		// Fill in section data
		section.sectionName = _sectionName;
		section.sectionId = _sectionId;
		section.sectionImage = _sectionImage;
	}
	
	/*
	* @dev Add a new chapter to the publication
	* @dev _chapterImage is optional - just use an empty string calldata if you don't want to add an image
	* @param _sectionName The name of the section
	* @param _chapterImage The image of the section
	*/
	function addChapter(uint256 _section, string calldata _chapterName, string calldata _chapterImage, uint256 _chapterId, string[] calldata _pageNames, string[] calldata _pageContent) public onlyOwner {
		// Get Existing Section
		Section storage section = sections[_section];
		Page[] storage pages = section.chapters[_chapterId].pages; 
		for (uint256 i = 0; i < _pageNames.length; i++) {
			pages[i] = Page(
				_pageNames[i],
				i + 1,
				_pageContent[i]
			);
		}

		section.chapters[_chapterId] = Chapter( 
			{
			chapterName: _chapterName,
			chapterId: _chapterId,
			// Check if _chapterImage is not an empty string calldata then set sectionImage to _chapterImage
			chapterImage: keccak256(abi.encode(_chapterImage)) != "" ?  _chapterImage : "",
			pages: pages			}
		);
			
				

	}

	/*
	* @dev Add a new page to the publication
	* @param _section The section the page belongs to
	* @param _chapter The chapter the page belongs to
	*/
	function addPage(uint256 _section, uint256 _chapter, string calldata _pageName, string calldata _pageContent) public onlyOwner {
		Chapter storage chapter = sections[_section].chapters[_chapter];

		chapter.pages.push(Page(
			_pageName,
			chapter.pages.length + 1,
			_pageContent
		));
	}

	function tokenURI(uint256 _tokenId) public view override returns (string memory uri) {

	}
}
