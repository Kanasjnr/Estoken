// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./PropertyToken.sol";

contract Marketplace is ERC1155Holder, ReentrancyGuard {
    PropertyToken public propertyToken;

    struct Listing {
        address seller;
        uint256 tokenId;
        uint256 amount;
        uint256 pricePerToken;
    }

    mapping(uint256 => Listing) public listings;
    uint256 public listingCount;

    event TokenListed(uint256 indexed listingId, address indexed seller, uint256 indexed tokenId, uint256 amount, uint256 pricePerToken);
    event TokenPurchased(uint256 indexed listingId, address indexed buyer, uint256 amount);
    event ListingCancelled(uint256 indexed listingId);

    constructor(address _propertyTokenAddress) {
        propertyToken = PropertyToken(_propertyTokenAddress);
    }

    function listToken(uint256 _tokenId, uint256 _amount, uint256 _pricePerToken) public nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        require(_pricePerToken > 0, "Price must be greater than 0");
        require(propertyToken.balanceOf(msg.sender, _tokenId) >= _amount, "Insufficient token balance");

        listingCount++;
        listings[listingCount] = Listing({
            seller: msg.sender,
            tokenId: _tokenId,
            amount: _amount,
            pricePerToken: _pricePerToken
        });

        propertyToken.safeTransferFrom(msg.sender, address(this), _tokenId, _amount, "");

        emit TokenListed(listingCount, msg.sender, _tokenId, _amount, _pricePerToken);
    }

    function purchaseToken(uint256 _listingId, uint256 _amount) public payable nonReentrant {
        Listing storage listing = listings[_listingId];
        require(listing.seller != address(0), "Listing does not exist");
        require(_amount > 0 && _amount <= listing.amount, "Invalid amount");
        require(msg.value >= listing.pricePerToken * _amount, "Insufficient payment");

        uint256 totalPrice = listing.pricePerToken * _amount;
        listing.amount -= _amount;

        if (listing.amount == 0) {
            delete listings[_listingId];
        }

        propertyToken.safeTransferFrom(address(this), msg.sender, listing.tokenId, _amount, "");
        payable(listing.seller).transfer(totalPrice);

        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }

        emit TokenPurchased(_listingId, msg.sender, _amount);
    }

    function cancelListing(uint256 _listingId) public nonReentrant {
        Listing storage listing = listings[_listingId];
        require(listing.seller == msg.sender, "Not the seller");

        propertyToken.safeTransferFrom(address(this), msg.sender, listing.tokenId, listing.amount, "");
        delete listings[_listingId];

        emit ListingCancelled(_listingId);
    }
}