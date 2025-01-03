// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract PropertyRegistry is Ownable {
    struct Property {
        string name;
        string location;
        uint256 tokenId;
        bool isActive;
    }

    mapping(uint256 => Property) public properties;
    uint256 public propertyCount;
    uint256 public listingFee = 0.1 ether; // Nominal fee for listing, can be adjusted

    event PropertyAdded(uint256 indexed propertyId, string name, string location, uint256 tokenId);
    event PropertyUpdated(uint256 indexed propertyId, string name, string location, bool isActive);
    event ListingFeeUpdated(uint256 newFee);
    event FeesCollected(uint256 amount);

    constructor() Ownable(msg.sender) {}

    function addProperty(string memory name, string memory location, uint256 tokenId) public payable onlyOwner {
        require(msg.value >= listingFee, "Insufficient listing fee");
        propertyCount++;
        properties[propertyCount] = Property(name, location, tokenId, true);
        emit PropertyAdded(propertyCount, name, location, tokenId);
        emit FeesCollected(listingFee);
    }

    function updateProperty(uint256 propertyId, string memory name, string memory location, bool isActive) public onlyOwner {
        require(propertyId <= propertyCount && propertyId > 0, "Property does not exist");
        Property storage property = properties[propertyId];
        property.name = name;
        property.location = location;
        property.isActive = isActive;
        emit PropertyUpdated(propertyId, name, location, isActive);
    }

    function getProperty(uint256 propertyId) public view returns (string memory, string memory, uint256, bool) {
        require(propertyId <= propertyCount && propertyId > 0, "Property does not exist");
        Property memory property = properties[propertyId];
        return (property.name, property.location, property.tokenId, property.isActive);
    }

    function updateListingFee(uint256 newFee) external onlyOwner {
        listingFee = newFee;
        emit ListingFeeUpdated(newFee);
    }

    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        payable(owner()).transfer(balance);
    }
}

