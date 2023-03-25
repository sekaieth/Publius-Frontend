// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import { ERC721EnumerableUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { Base64 } from "@openzeppelin/contracts/utils/Base64.sol";
import "hardhat/console.sol";

/// @title Publius - Publication management on the blockchain
/// @notice This contract represents a publication with sections, chapters, and pages.
/// @author SΞkai - https://github.com/sekaieth

contract Publius is 
	Initializable, 
	ERC721EnumerableUpgradeable, 
	OwnableUpgradeable {
	
	// GLOBAL STATE
    uint256 public publicationId;

	/// @notice Track who owns what token ID
	mapping(uint256 => address) public tokenIdToMinter;
	/// @notice Track how many tokens each minter has minted
	mapping(address => uint256[]) public minterOwnedTokens;
	/// @notice Publication section storage
	mapping(uint256 => Section) public sections;
	/// @notice Publication chapter storage
	mapping(uint256 => Chapter) public chapters;

	/// @notice Publication metadata
	string public publicationName;
	address public publicationAuthor;
    string publicationAuthorName;
	string public publicationCoverImage;
	uint256 sectionCount;
    uint256 costToMint; 

	/// @dev Section struct definition
	struct Section {
		string sectionName;
		uint256 sectionId;
		string sectionImage;
		uint256[] chapters;
	}
	
	/// @dev Chapter struct definition
	struct Chapter {
		string chapterName;
		uint256 chapterId;
		string chapterImage;
		mapping(uint256 => Page) pages;
        uint256[] pageIds;
	}

	/// @dev Page struct definition
	struct Page {
		string pageName;
		uint256 pageId;
		string pageContent;
	}

    event SectionAdded(
        uint256 sectionId,
        string sectionName,
        string sectionImage,
        uint256[] chapterIds
    );
    event ChapterAdded(
        uint256 chapterId,
        string chapterName,
        string chapterImage,
        uint256[] pageIds
    );
    event PageAdded(
        uint256 pageId,
        string pageName,
        string pageContent
    );
    event SectionModified(
        uint256 sectionId,
        string sectionName,
        string sectionImage
    );
    event ChapterModified(
        uint256 chapterId,
        string chapterName,
        string chapterImage
    );
    event PageModified(
        uint256 pageId,
        string pageName,
        string pageContent
    );

	/// @notice Initialize the contract
	/// @param _publicationAuthorAddress The author of the publication
	/// @param _publicationName The name of the publication
	/// @param _publicationCoverImage The cover image of the publication
	function initialize(
        uint256 _publicationId, 
        address _publicationAuthorAddress,
        string calldata _publicationAuthorName, 
        string calldata _publicationName, 
        string calldata _publicationCoverImage,
        uint256 _costToMint
    ) public initializer {
		__ERC721_init(_publicationName, "PUBLIUS");
		__Ownable_init();
		transferOwnership(_publicationAuthorAddress);
        require(_publicationId != 0, "Publius: Publication ID cannot be 0");
        require(_publicationAuthorAddress != address(0), "Publius: Publication author cannot be 0 address");
        require(keccak256(abi.encode(_publicationName)) != keccak256(abi.encode("")), "Publius: Publication name cannot be empty");
        require(keccak256(abi.encode(_publicationAuthorName)) != keccak256(abi.encode("")), "Publius: Publication author name cannot be empty");
        require(keccak256(abi.encode(_publicationCoverImage)) != keccak256(abi.encode("")), "Publius: Publication cover image cannot be empty");
        require(keccak256(abi.encode(_publicationAuthorName)) != keccak256(abi.encode("")), "Publius: Publication author name cannot be empty");
        publicationId = _publicationId;
		publicationName = _publicationName;
		publicationAuthor = _publicationAuthorAddress;
		publicationCoverImage = _publicationCoverImage;
        publicationAuthorName = _publicationAuthorName;
        costToMint = _costToMint;
	}

	/// @notice Mint new tokens
	/// @param _amount The number of tokens to mint
	function mint(uint256 _amount) public payable {
		require(msg.value >= _amount * costToMint, "Not enough ETH sent");
		for (uint256 i = 0; i < _amount; i++) {
			uint256 tokenId = totalSupply() + 1;
			_mint(msg.sender, tokenId);
			tokenIdToMinter[tokenId] = msg.sender;
			minterOwnedTokens[msg.sender].push(tokenId);
		}
        if(msg.value > 0) {
            (bool success, ) = publicationAuthor.call{value: msg.value}("");
            require(success, "Transfer failed.");
        }
	}

/**
 * @dev Add a new section, chapters, and pages to the publication
 * @param _sectionInfo Encoded information about the section (sectionName, sectionImage, sectionId)
 * @param _chapterInfo Encoded information about the chapters (chapterNames[], chapterImages[], chapterIds[])
 * @param _pageInfo Encoded information about the pages (pageNames[][], pageContent[][], pageIds[][])
 */
    function addSection(bytes calldata _sectionInfo, bytes calldata _chapterInfo, bytes calldata _pageInfo) public onlyOwner {
        require(_sectionInfo.length != 0, "Publius: Section info cannot be empty");
        require(_chapterInfo.length != 0, "Publius: Chapter info cannot be empty");
        require(_pageInfo.length != 0, "Publius: Page info cannot be empty");
        
        // Decode Section Info
        (
            string memory _sectionName, 
            string memory _sectionImage, 
            uint256 _sectionId
        ) = abi.decode(_sectionInfo, (string, string, uint256));
        
        require(_sectionId != 0, "Publius: Section ID cannot be 0");
        require(keccak256(abi.encode(_sectionName)) != keccak256(abi.encode("")), "Publius: Section name cannot be empty");

        // Decode chapter info
        (
            string[] memory _chapterNames, 
            string[] memory _chapterImages, 
            uint256[] memory _chapterIds 
        ) = abi.decode(_chapterInfo, (string[], string[], uint256[]));

        require(_chapterIds.length != 0, "Publius: Chapter IDs cannot be empty");
        require(_chapterNames.length != 0, "Publius: Chapter names cannot be empty");
        // Decode page info
        (
            string[][] memory _pageNames, 
            string[][] memory _pageContent,
            uint256[][] memory _pageIds
        ) = abi.decode(_pageInfo, (string[][], string[][], uint256[][]));
        
        require(_pageNames.length != 0, "Publius: Page names cannot be empty");
        require(_pageIds.length != 0, "Publius: Page IDs cannot be empty");
    
        // Fill in section data
        Section storage newSection = sections[_sectionId];
        newSection.sectionName = _sectionName;
        newSection.sectionId = _sectionId;
        newSection.sectionImage = _sectionImage;

        // Load each chapter with pages
        for(uint256 i = 0; i < _chapterIds.length; i++) {
                addChapter(newSection.sectionId, _chapterNames[i], _chapterImages[i], _chapterIds[i], _pageNames[i], _pageContent[i], _pageIds[i]);
        }
        sectionCount++;

        emit SectionAdded(_sectionId, _sectionName, _sectionImage, _chapterIds);
    }

    /**
     * @notice Modify an existing section in the publication
     * @param _sectionId The ID of the section to modify
     * @param _newSectionName The new name of the section
     * @param _newSectionImage The new image of the section
     */
    function modifySection(uint256 _sectionId, string calldata _newSectionName, string calldata _newSectionImage) public onlyOwner {
        // Ensure that the section exists
        require(sections[_sectionId].sectionId != 0, "Publius: Section does not exist");
        require(keccak256(abi.encode(_newSectionName)) != keccak256(abi.encode("")), "Publius: New section name cannot be empty");
        require(keccak256(abi.encode(_newSectionImage)) != keccak256(abi.encode("")), "Publius: New section image cannot be empty");

        // Update the section data
        Section storage section = sections[_sectionId];
        section.sectionId = _sectionId;
        section.sectionName = _newSectionName;
        section.sectionImage = _newSectionImage;

        emit SectionModified(_sectionId, _newSectionName, _newSectionImage);
    }

    /**
     * @dev Add a new chapter to the publication
     * @param _sectionId The id of the section the chapter belongs to
     * @param _chapterName The name of the chapter
     * @param _chapterImage The image of the chapter
     * @param _chapterId The id of the chapter
     * @param _pageNames Array of page names
     * @param _pageContent Array of page content
     * @param _pageIds Array of page ids
     */
    function addChapter(uint256 _sectionId, string memory _chapterName, string memory _chapterImage, uint256 _chapterId, string[] memory _pageNames, string[] memory _pageContent, uint256[] memory _pageIds) public onlyOwner {
        // Require that the section exists
        require(sections[_sectionId].sectionId != 0, "Publius: Section does not exist");
        require(chapters[_chapterId].chapterId == 0 || !isChapterInSection(_chapterId, _sectionId), "Publius: Chapter already exists");
        require(_chapterId != 0, "Publius: Chapter ID cannot be 0");
        require(keccak256(abi.encode(_chapterName)) != keccak256(abi.encode("")), "Publius: Chapter name cannot be empty");
        require(_pageNames.length != 0, "Publius: Page names cannot be empty");
        require(_pageIds.length != 0, "Publius: Page IDs cannot be empty");
        require(_pageContent.length != 0, "Publius: Page content cannot be empty");
        require(_pageNames.length == _pageContent.length, "Publius: Page names and content must be the same length");
        require(_pageNames.length == _pageIds.length, "Publius: Page names and IDs must be the same length");

        Chapter storage chapter = chapters[_chapterId];

        // Fill in chapter data
        chapter.chapterName = _chapterName;
        chapter.chapterId = _chapterId;
        chapter.chapterImage = _chapterImage;
        sections[_sectionId].chapters.push(_chapterId);

        // Add pages to the chapter
        for (uint256 i = 0; i < _pageNames.length; i++) {
            addPage(chapter.chapterId, _pageNames[i], _pageContent[i], _pageIds[i]);
        }

        emit ChapterAdded(_chapterId, _chapterName, _chapterImage, _pageIds);
    }

    /**
     * @dev Modify an existing chapter's data
     * @param _chapterId The id of the chapter to modify
     * @param _newChapterName The new name for the chapter
     * @param _newChapterImage The new image for the chapter
     */
    function modifyChapter(uint256 _chapterId, string memory _newChapterName, string memory _newChapterImage) public onlyOwner {
        // Ensure that the chapter exists
        require(chapters[_chapterId].chapterId != 0, "Publius: Chapter does not exist");
        require(keccak256(abi.encode(_newChapterName)) != keccak256(abi.encode("")), "Publius: New chapter name cannot be empty");
        require(keccak256(abi.encode(_newChapterImage)) != keccak256(abi.encode("")), "Publius: New chapter image cannot be empty");

        Chapter storage chapter = chapters[_chapterId];

        // Update the chapter's data
        chapter.chapterName = _newChapterName;
        chapter.chapterImage = _newChapterImage;

        emit ChapterModified(_chapterId, _newChapterName, _newChapterImage);
    }


    /**
     * @dev Add a new page to the publication
     * @param _chapter The id of the chapter the page belongs to
     * @param _pageName The name of the page
     * @param _pageContent The content of the page
     * @param _pageId The id of the page
     */
    function addPage(uint256 _chapter, string memory _pageName, string memory _pageContent, uint256 _pageId) public onlyOwner {
        // Ensure that the chapter exists
        require(keccak256(abi.encode(chapters[_chapter].chapterName)) != keccak256(abi.encode("")), "Publius: Chapter does not exist");
        require(keccak256(abi.encode(_pageName)) != keccak256(abi.encode("")), "Publius: Page name cannot be empty");
        require(_pageId != 0, "Publius: Page ID cannot be 0");
        require(keccak256(abi.encode(_pageContent)) != keccak256(abi.encode("")), "Publius: Page content cannot be empty");
        require(chapters[_chapter].pages[_pageId].pageId == 0, "Publius: Page already exists");

        Chapter storage chapter = chapters[_chapter];

        // Add the new page to the chapter
        chapter.pages[_pageId] = (Page(
            _pageName,
            _pageId,
            _pageContent
        ));
        chapter.pageIds.push(_pageId);

        emit PageAdded(_pageId, _pageName, _pageContent);
    }

    /**
     * @dev Modify an existing page's data
     * @param _chapterId The id of the chapter the page belongs to
     * @param _pageId The id of the page to modify
     * @param _newPageName The new name for the page
     * @param _newPageContent The new content for the page
     */
    function modifyPage(uint256 _chapterId, uint256 _pageId, string memory _newPageName, string memory _newPageContent) public onlyOwner {
        // Ensure that the chapter exists
        require(chapters[_chapterId].chapterId != 0, "Publius: Chapter does not exist");
        // Ensure that the page exists
        require(chapters[_chapterId].pages[_pageId].pageId != 0, "Publius: Page does not exist");
        require(keccak256(abi.encode(_newPageName)) != keccak256(abi.encode("")), "Publius: New page name cannot be empty");
        require(keccak256(abi.encode(_newPageContent)) != keccak256(abi.encode("")), "Publius: New page content cannot be empty");

        Chapter storage chapter = chapters[_chapterId];

        // Update the page's data
        chapter.pages[_pageId].pageName = _newPageName;
        chapter.pages[_pageId].pageContent = _newPageContent;

        emit PageModified(_pageId, _newPageName, _newPageContent);
    }

    /**
     * @dev Get a page from the specified chapter
     * @param _chapter The id of the chapter the page belongs to
     * @param _pageId The id of the page
     * @return page The page with the given id in the specified chapter
     */
    function getPage(uint256 _chapter, uint256 _pageId) public view returns (Page memory) {
        Chapter storage chapter = chapters[_chapter];
        return chapter.pages[_pageId];	
    }

    /**
     * @dev Get the ids of all pages in the specified chapter
     * @param _chapter The id of the chapter
     * @return pageIds The ids of all pages in the specified chapter
     */
    function getPageIds(uint256 _chapter) public view returns (uint256[] memory) {
        Chapter storage chapter = chapters[_chapter];
        return chapter.pageIds;
    }

    /**
     * @dev Helper function to convert a uint to a string
     * @param num The uint to convert
     * @return str The string representation of the input uint
     */
    function uint2str(uint256 num) internal pure returns (string memory) {
        if (num == 0) {
            return "0";
        }
        uint256 j = num;
        uint256 length;
        // Determine the length of the resulting string
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        // Construct the string representation of the input uint
        while (num != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(num % 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            num /= 10;
        }
        return string(bstr);
    }

    /**
     * @dev Convert an address to its string representation
     * @param _address The address to convert
     * @return str The string representation of the input address
     */
    function addressToString(address _address) public pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_address)));
        bytes memory alphabet = "0123456789abcdef";
        
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        // Construct the string representation of the input address
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3 + i * 2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }

    /**
     * @notice Check if a chapter is within a section's chapters array
     * @param _sectionId The ID of the section to check
     * @param _chapterId The ID of the chapter to look for
     * @return bool true if the chapter is in the section, false otherwise
     */
    function isChapterInSection(uint256 _sectionId, uint256 _chapterId) internal view returns (bool) {
        Section storage section = sections[_sectionId];
        uint256 length = section.chapters.length;
        for (uint256 i = 0; i < length; i++) {
            if (section.chapters[i] == _chapterId) {
                return true;
            }
        }
        return false;
    }

    /**
     * @notice Withdraw ETH from the contract
     * @param _amount The amount of ETH to withdraw
     */
    function withdraw(uint256 _amount) public onlyOwner {
        require(_amount > 0, "Publius: Withdraw amount must be greater than 0");
        require(address(this).balance >= _amount, "Publius: Insufficient contract balance");

        (bool success, ) = publicationAuthor.call{value: _amount}("");
        require(success, "Publius: ETH withdrawal failed");
    }


    /**
     * @dev Get the token URI
     * @return uri The complete token URI
     */
    function tokenURI(uint256 _tokenId) override public view returns (string memory uri) {
        // Ensure the token exists
        require(_exists(_tokenId), "Token does not exist");

        // Build the JSON structure
        string memory json = '{';

        // Add publication details to JSON
        json = string(abi.encodePacked(
                    json,
                    '"name": "',
                    publicationName,
                    '", "author": "',
                    publicationAuthorName,
                    '", "image": "',
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
            for (uint256 j = 0; j < section.chapters.length; j++) {
                // Get the chapter details
                uint256 chapterId = section.chapters[j];
                Chapter storage chapter = chapters[chapterId];

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
                for (uint256 k = 0; k < chapter.pageIds.length; k++) {
                    // Get the page details
                    Page storage page = chapter.pages[chapter.pageIds[k]];

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
                    if (k < chapter.pageIds.length - 1) {
                        pageJson = string(abi.encodePacked(pageJson, ","));
                    }

                    // Add page JSON to chapter JSON
                    chapterJson = string(abi.encodePacked(chapterJson, pageJson));
                }

                // Close the pages array
                chapterJson = string(abi.encodePacked(chapterJson, "]}"));

                // Add a comma to separate chapters
                if (j < section.chapters.length - 1) {
                    chapterJson = string(abi.encodePacked(chapterJson, ","));
                }

                // Add chapter JSON to section JSON
                sectionJson = string(abi.encodePacked(sectionJson, chapterJson));
            }

            // Close the chapters array
            sectionJson = string(abi.encodePacked(sectionJson, "]}"));

            // Add a comma to separate sections
            if (i < sectionCount) {
                sectionJson = string(abi.encodePacked(sectionJson, ","));
            }
        // Add section JSON to publication JSON
        json = string(abi.encodePacked(json, sectionJson));
        }

        // Close the sections array
        json = string(abi.encodePacked(json, "]}"));

        // Base64 encode the JSON string
        bytes memory jsonBytes = bytes(json);
        string memory encodedJson = Base64.encode(jsonBytes);

        // Construct the data URI string
        return string(abi.encodePacked("data:application/json;base64,", encodedJson));

	}
}