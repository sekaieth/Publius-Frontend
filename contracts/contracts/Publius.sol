// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import { ERC721EnumerableUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { BeaconProxy } from "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import 'base64-sol/base64.sol';
import "hardhat/console.sol";

contract Publius is 
	Initializable, 
	ERC721EnumerableUpgradeable, 
	OwnableUpgradeable {
	
	// GLOBAL STATE

	// @dev Track ho owns what token ID
	mapping(uint256 => address) public tokenIdToMinter;
	// @dev Track how many tokens each minter has minted
	mapping(address => uint256[]) public minterOwnedTokens;
	// @dev Publication section storage
	mapping(uint256 => Section) public sections;
	// @dev Publication chapter storage
	mapping(uint256 => Chapter) public chapters;

	// @dev Publication metadata
	string public publicationName;
	address public publicationAuthor;
	string public publicationCoverImage;
	uint256 sectionCount;

	struct Section {
		string sectionName;
		uint256 sectionId;
		string sectionImage;
		uint256[] chapters;
	}
	
	struct Chapter {
		string chapterName;
		uint256 chapterId;
		string chapterImage;
		mapping(uint256 => Page) pages;
		uint256 pageCount;
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
		__ERC721_init(_publicationName, "PUBLIUS");
		__Ownable_init();
		transferOwnership(_publicationAuthor);
		publicationName = _publicationName;
		publicationAuthor = _publicationAuthor;
		publicationCoverImage = _publicationCoverImage;
	}

	/*
	@dev Mint new tokens
	@param _to The address to mint the tokens to
	*/
	function mint(uint256 _amount) public payable {
		require(msg.value >= _amount * 0.01 ether, "Not enough ETH sent");
		for (uint256 i = 0; i < _amount; i++) {
			uint256 tokenId = totalSupply() + 1;
			_mint(msg.sender, tokenId);
			tokenIdToMinter[tokenId] = msg.sender;
			minterOwnedTokens[msg.sender].push(tokenId);
		}
	}

	function addSection(bytes calldata _sectionInfo, bytes calldata _chapterInfo, bytes calldata _pageInfo) public onlyOwner {
		// Decode Section Info
		(
			string memory _sectionName, 
			string memory _sectionImage, 
			uint256 _sectionId
		) = abi.decode(_sectionInfo, (string, string, uint256));

		// Decode chapter info
		(
			string[] memory _chapterNames, 
			string[] memory _chapterImages, 
			uint256[] memory _chapterIds 
		) = abi.decode(_chapterInfo, (string[], string[], uint256[]));

		// Decode page info
		(
			string[] memory _pageNames, 
			string[] memory _pageContent
		) = abi.decode(_pageInfo, (string[], string[]));

		// Fill in section data
		uint256 newSection = sectionCount + 1;
		sections[newSection].sectionName = _sectionName;
		sections[newSection].sectionId = _sectionId;
		sections[newSection].sectionImage = _sectionImage;
		sections[newSection].chapters = _chapterIds;

		

    // Load each chapter with pages
    for(uint256 i = 1; i < _chapterIds.length; i++) {
		console.log("CHAPTER ID", _chapterIds[i]);
        // Check if the chapter belongs to the current section
        if (_chapterIds[i] == sections[_sectionId].chapters[i]) {
            addChapter(_chapterNames[i], _chapterImages[i], _chapterIds[i], _pageNames, _pageContent);
            sections[newSection].chapters.push(_chapterIds[i]);
        }
    }

		sectionCount++;
	}
	
	/*
	* @dev Add a new chapter to the publication
	* @dev _chapterImage is optional - just use an empty string calldata if you don't want to add an image
	* @param _chapterName The name of the chapter
	* @param _chapterImage The image of the chapter
	*/
	function addChapter(string memory _chapterName, string memory _chapterImage, uint256 _chapterId, string[] memory _pageNames, string[] memory _pageContent) public onlyOwner {
		Chapter storage chapter = chapters[_chapterId];
		for (uint256 i = 0; i < _pageNames.length; i++) {
			chapter.pages[i + 1] = Page(
				_pageNames[i],
				i + 1,
				_pageContent[i]
			);
			chapter.pageCount++;
		}

		chapter.chapterName = _chapterName;
		chapter.chapterId = _chapterId;
		chapter.chapterImage = keccak256(abi.encode(_chapterImage)) != "" ?  _chapterImage : "";

	}

	/*
	* @dev Add a new page to the publication
	* @param _section The section the page belongs to
	* @param _chapter The chapter the page belongs to
	*/
	function addPage(uint256 _chapter, string calldata _pageName, string calldata _pageContent) public onlyOwner {
		require(keccak256(abi.encode(chapters[_chapter].chapterName)) != keccak256(abi.encode("")), "Chapter does not exist");
		Chapter storage chapter = chapters[_chapter];

		chapter.pages[chapter.pageCount + 1] = (Page(
			_pageName,
			chapter.pageCount + 1,
			_pageContent
		));
		chapter.pageCount++;
	}

	function getPage(uint256 _chapter, uint256 _pageId) public view returns (Page memory) {
		Chapter storage chapter = chapters[_chapter];
		return chapter.pages[_pageId];	
	}

	/*
	@dev - Helper function to convert a uint to a string
	@param num - The uint to convert
	*/
    function uint2str(uint256 num) internal pure returns (string memory) {
        if (num == 0) {
            return "0";
        }
        uint256 j = num;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        while (num != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(num % 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            num /= 10;
        }
        return string(bstr);
    }

    function addressToString(address _address) public pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_address)));
        bytes memory alphabet = "0123456789abcdef";
        
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3 + i * 2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }
	/*
	* @dev Get the token URI
	* @param tokenId The token ID to get the URI for
	*/
function tokenURI(uint256 tokenId) public view override returns (string memory) {
    require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

    // Build the JSON structure
	string memory json = '{';

	// Add publication details to JSON
	json = string(abi.encodePacked(
		json,
		'"publicationName": "',
		publicationName,
		'", "authorName": "',
		addressToString(publicationAuthor),
		'", "coverImage": "',
		publicationCoverImage,
		'", "sections": ['
	));

    // Loop over sections
    for (uint256 i = 1; i <= sectionCount; i++) {
        // Get the section details
        Section storage section = sections[i];

        // Add section details to JSON
        string memory sectionJson = string(abi.encodePacked(
            '{ "sectionId": "',
            uint2str(section.sectionId),
            '", "sectionName": "',
            section.sectionName,
            '", "sectionImage": "',
            section.sectionImage,
            '", "chapters": ['
        ));

        // Loop over chapters
        for (uint256 j = 1; j <= section.chapters.length; j++) {
            // Get the chapter details
            Chapter storage chapter = chapters[j];

            // Add chapter details to JSON
            string memory chapterJson = string(abi.encodePacked(
                '{ "chapterId": "',
                uint2str(chapter.chapterId),
                '", "chapterName": "',
                chapter.chapterName,
                '", "chapterImage": "',
                chapter.chapterImage,
                '", "pages": ['
            ));

            // Loop over pages
            for (uint256 k = 1; k <= chapter.pageCount; k++) {
                // Get the page details
                Page storage page = chapter.pages[k];

                // Add page details to JSON
                string memory pageJson = string(abi.encodePacked(
                    '{ "pageId": "',
                    uint2str(page.pageId),
                    '", "pageName": "',
                    page.pageName,
                    '", "pageContent": "',
                    page.pageContent,
                    '"}'
                ));

                // Add a comma to separate pages
                if (k < chapter.pageCount) {
                    pageJson = string(abi.encodePacked(pageJson, ","));
                }

                // Add page JSON to chapter JSON
                chapterJson = string(abi.encodePacked(chapterJson, pageJson));
            }

            // Close the pages array
            chapterJson = string(abi.encodePacked(chapterJson, "]}"));

            // Add a comma to separate chapters
            if (j < section.chapters.length) {
                chapterJson = string(abi.encodePacked(chapterJson, ","));
            }

            // Add chapter JSON to section JSON
            sectionJson = string(abi.encodePacked(sectionJson, chapterJson));
        }

        // Close the chapters array
        sectionJson = string(abi.encodePacked(sectionJson, "]}"));

        // Add a comma to separate sections
        if (i < sectionCount - 1) {
			sectionJson = string(abi.encodePacked(sectionJson, ","));
		}
     // Add section JSON to publication JSON
     json = string(abi.encodePacked(json, sectionJson));
	}

	// Close the sections array
	json = string(abi.encodePacked(json, "]}"));


	// Concatenate the base URI and the JSON structure to form the complete URI
	string memory baseURI = _baseURI();
	return string(abi.encodePacked(baseURI, json));
	}
}