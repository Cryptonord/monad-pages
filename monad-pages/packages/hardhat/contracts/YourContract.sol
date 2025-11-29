// SPDX-License-Identifier: MIT
// CORRECTED PRAGMA TO MATCH SCAFFOLD-ETH 2'S DEFAULT COMPILER
pragma solidity 0.8.20;

// No longer need to import Counter.sol
import "hardhat/console.sol";

/**
 * @title YourContract (Monad Pages)
 * @author Your Name
 * @notice This contract allows users to deploy static websites (called "Pages")
 * fully on-chain by storing their content in chunks. It also includes a tip jar.
 * This version is designed for Scaffold-ETH 2 and OpenZeppelin v5+.
 */
contract YourContract {
    // Replaced the Counters library with a simple uint256 for the page ID counter.
    // This is more gas-efficient and the standard practice.
    uint256 private _pageCounter;

    // The main data structure for storing a Page's information.
    struct Page {
        uint256 id;
        address owner;
        string title;           // A title for the page, e.g., "My Portfolio".
        string[] contentChunks; // The page content, split into an array of strings.
        string mimeType;        // The content type (e.g., "text/html").
        uint256 totalSize;      // The total size of the content in bytes.
        uint256 createdAt;      // The timestamp when the page was deployed.
        uint256 totalTips;      // Total amount of tips received.
    }

    // --- MAPPINGS ---

    // Mapping from a unique page ID to the Page struct.
    mapping(uint256 => Page) public pages;
    // Mapping from an owner's address to an array of their page IDs.
    mapping(address => uint256[]) public ownerToPageIds;

    // --- EVENTS ---

    event PageDeployed(
        uint256 indexed pageId,
        address indexed owner,
        string title,
        uint256 totalSize,
        string mimeType
    );

    event TipSent(
        uint256 indexed pageId,
        address indexed tipper,
        uint256 amount
    );

    // --- STATE-CHANGING FUNCTIONS ---

    /**
     * @notice Deploys a new page by storing its content on-chain.
     * @param _title The title for the page.
     * @param _contentChunks The page content, pre-split into chunks by the frontend.
     * @param _mimeType The MIME type of the file being uploaded.
     */
    function deployPage(
        string memory _title,
        string[] memory _contentChunks,
        string memory _mimeType
    ) public {
        require(bytes(_title).length > 0, "Title cannot be empty.");
        require(_contentChunks.length > 0, "Content cannot be empty.");

        // Use the simple counter pattern
        uint256 newPageId = _pageCounter;
        _pageCounter++;

        uint256 totalSize = 0;
        for (uint i = 0; i < _contentChunks.length; i++) {
            totalSize += bytes(_contentChunks[i]).length;
        }

        // A safety limit to prevent abuse. 1MB is generous for a hackathon.
        require(totalSize <= 1 * 1024 * 1024, "Total content size exceeds 1MB limit.");

        pages[newPageId] = Page({
            id: newPageId,
            owner: msg.sender,
            title: _title,
            contentChunks: _contentChunks,
            mimeType: _mimeType,
            totalSize: totalSize,
            createdAt: block.timestamp,
            totalTips: 0
        });

        ownerToPageIds[msg.sender].push(newPageId);

        emit PageDeployed(newPageId, msg.sender, _title, totalSize, _mimeType);
    }

    /**
     * @notice Sends a tip (in the native currency) to the owner of a page.
     * @param _pageId The ID of the page to send a tip to.
     */
    function tip(uint256 _pageId) public payable {
        require(msg.value > 0, "Tip amount must be greater than zero.");
        Page storage page = pages[_pageId];
        require(page.owner != address(0), "Page does not exist.");

        page.totalTips += msg.value;

        (bool success, ) = payable(page.owner).call{value: msg.value}("");
        require(success, "Failed to send tip.");

        emit TipSent(_pageId, msg.sender, msg.value);
    }

    // --- VIEW FUNCTIONS (for frontend) ---

    /**
     * @notice Retrieves all data for a specific page.
     * @param _pageId The ID of the page to query.
     * @return A Page struct containing all page data.
     */
    function getPage(uint256 _pageId) public view returns (Page memory) {
        return pages[_pageId];
    }

    /**
     * @notice Returns the total number of pages ever deployed.
     * @return The current value of the page ID counter.
     */
    function getTotalPages() public view returns (uint256) {
        return _pageCounter;
    }

    /**
     * @notice Fetches all pages in reverse chronological order for the homepage feed.
     * @return An array of Page structs.
     */
    function getAllPages() public view returns (Page[] memory) {
        uint256 totalPages = _pageCounter;
        if (totalPages == 0) {
            return new Page[](0);
        }

        Page[] memory allPages = new Page[](totalPages);
        for (uint256 i = 0; i < totalPages; i++) {
            // We iterate backwards to get the newest pages first.
            uint256 pageId = totalPages - 1 - i;
            allPages[i] = pages[pageId];
        }

        return allPages;
    }
}
