// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IPublius {
    function initialize(address _publicationAuthor, string calldata _publicationName, string calldata _publicationCoverImage) external;
    function mint(uint256 _amount) external payable;
    function addSection(bytes calldata _sectionInfo, bytes calldata _chapterInfo, bytes calldata _pageInfo) external;
    function addChapter(uint256 _sectionId, string memory _chapterName, string memory _chapterImage, uint256 _chapterId, string[] memory _pageNames, string[] memory _pageContent, string[] memory _pageIds) external;
    function addPage(uint256 _chapter, string memory _pageName, string memory _pageContent, string memory _pageId) external;
    function getPage(uint256 _chapter, uint256 _pageId) external view returns (
        string memory pageName,
        string memory pageId,
        string memory pageContent
    );
    function tokenURI() external view returns (string memory);
}
