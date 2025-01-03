// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Marketplace is ERC1155Holder, Ownable {
    IERC1155 public propertyToken;

    uint256 public constant TRANSACTION_FEE_PERCENTAGE = 2;

    struct Listing {
        address seller;
        uint256 tokenId;
        uint256 amount;
        uint256 pricePerToken;
        bool isActive;
    }

    mapping(uint256 => Listing) public listings;
    uint256 public listingCount;

    event Listed(uint256 indexed listingId, address indexed seller, uint256 tokenId, uint256 amount, uint256 pricePerToken);
    event Sale(uint256 indexed listingId, address indexed buyer, uint256 amount);
    event ListingCancelled(uint256 indexed listingId);
    event FeesCollected(uint256 amount);

    constructor(address _propertyToken) Ownable(msg.sender) {
        propertyToken = IERC1155(_propertyToken);
    }

    function createListing(uint256 tokenId, uint256 amount, uint256 pricePerToken) external {
        require(amount > 0, "Amount must be greater than 0");
        require(pricePerToken > 0, "Price must be greater than 0");

        propertyToken.safeTransferFrom(msg.sender, address(this), tokenId, amount, "");

        listingCount++;
        listings[listingCount] = Listing(msg.sender, tokenId, amount, pricePerToken, true);

        emit Listed(listingCount, msg.sender, tokenId, amount, pricePerToken);
    }

    function buyTokens(uint256 listingId, uint256 amount) external payable {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing is not active");
        require(amount <= listing.amount, "Not enough tokens available");

        uint256 totalPrice = amount * listing.pricePerToken;
        uint256 fee = (totalPrice * TRANSACTION_FEE_PERCENTAGE) / 100;
        uint256 totalCost = totalPrice + fee;
        require(msg.value >= totalCost, "Insufficient payment");

        listing.amount -= amount;
        if (listing.amount == 0) {
            listing.isActive = false;
        }

        propertyToken.safeTransferFrom(address(this), msg.sender, listing.tokenId, amount, "");
        payable(listing.seller).transfer(totalPrice);

        emit Sale(listingId, msg.sender, amount);
        emit FeesCollected(fee);
    }

    function cancelListing(uint256 listingId) external {
        Listing storage listing = listings[listingId];
        require(msg.sender == listing.seller, "Only seller can cancel listing");
        require(listing.isActive, "Listing is not active");

        listing.isActive = false;
        propertyToken.safeTransferFrom(address(this), msg.sender, listing.tokenId, listing.amount, "");

        emit ListingCancelled(listingId);
    }

    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);
    }
}

