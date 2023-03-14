// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

abstract contract IPublius {
    function tokenURI(uint256 tokenId) public view virtual returns (string memory);
    function addChapter(uint256 _section, string calldata _chapterName, string calldata _chapterImage, uint256 _chapterId, string[] calldata _pageNames, string[] calldata _pageContent) public virtual;
    function addPage(uint256 _section, uint256 _chapter, string calldata _pageName, string calldata _pageContent) public virtual;
}


