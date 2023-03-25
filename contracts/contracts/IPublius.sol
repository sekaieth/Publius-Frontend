// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IPublius {
    function tokenIdToMinter(uint256 tokenId) external view returns (address);
    function minterOwnedTokens(address minter) external view returns (uint256[] memory);
    function sections(uint256 sectionId) external view returns (string memory, uint256, string memory, uint256[] memory);
    function chapters(uint256 chapterId) external view returns (string memory, uint256, string memory, uint256[] memory);
    function publicationName() external view returns (string memory);
    function publicationAuthor() external view returns (address);
    function publicationAuthorName() external view returns (string memory);
    function publicationCoverImage() external view returns (string memory);
    function sectionCount() external view returns (uint256);
    function costToMint() external view returns (uint256);
    function mint(uint256 _amount) external payable;
    function addSection(bytes calldata _sectionInfo, bytes calldata _chapterInfo, bytes calldata _pageInfo) external;
    function modifySection(uint256 _sectionId, string calldata _newSectionName, string calldata _newSectionImage) external;
    function addChapter(uint256 _sectionId, string memory _chapterName, string memory _chapterImage, uint256 _chapterId, string[] memory _pageNames, string[] memory _pageContent, uint256[] memory _pageIds) external;
    function modifyChapter(uint256 _chapterId, string memory _newChapterName, string memory _newChapterImage) external;
    function addPage(uint256 _chapter, string memory _pageName, string memory _pageContent, uint256 _pageId) external;
    function modifyPage(uint256 _chapterId, uint256 _pageId, string memory _newPageName, string memory _newPageContent) external;
}

interface IPubliusFactory {
    function createPublication(
        uint256 _id, 
        address _publicationAuthorAddress, 
        string calldata _publicationAuthorName,
        string calldata _publicationName, 
        string calldata _publicationCoverImage,
        uint256 _costToMint
    ) external returns (address);
}