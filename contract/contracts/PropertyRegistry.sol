// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract PropertyRegistry is Ownable {
    struct Property {
        string name;
        string location;
        uint256 tokenId;
        bool isActive;
        string[] imageUrls;
    }

    mapping(uint256 => Property) public properties;
    uint256 public propertyCount;

    event PropertyAdded(uint256 indexed propertyId, string name, string location, uint256 tokenId, string[] imageUrls);
    event PropertyUpdated(uint256 indexed propertyId, string name, string location, bool isActive, string[] imageUrls);
    event FeesCollected(uint256 amount);

    constructor() Ownable(msg.sender) {}

    function addProperty(
        string memory name,
        string memory location,
        uint256 tokenId,
        string[] memory imageUrls
    ) public payable {
        propertyCount++;
        properties[propertyCount] = Property(name, location, tokenId, true, imageUrls);
        
        emit PropertyAdded(propertyCount, name, location, tokenId, imageUrls);
        if (msg.value > 0) {
            emit FeesCollected(msg.value);
        }
    }

    function updateProperty(
        uint256 propertyId,
        string memory name,
        string memory location,
        bool isActive
    ) public onlyOwner {
        require(propertyId <= propertyCount && propertyId > 0, "Property does not exist");
        Property storage property = properties[propertyId];
        property.name = name;
        property.location = location;
        property.isActive = isActive;
        emit PropertyUpdated(propertyId, name, location, isActive, property.imageUrls);
    }

    function updatePropertyImages(uint256 propertyId, string[] memory newImageUrls) public onlyOwner {
        require(propertyId <= propertyCount && propertyId > 0, "Property does not exist");
        Property storage property = properties[propertyId];
        property.imageUrls = newImageUrls;
        emit PropertyUpdated(propertyId, property.name, property.location, property.isActive, newImageUrls);
    }

    function getProperty(uint256 propertyId) public view returns (
        string memory,
        string memory,
        uint256,
        bool,
        string[] memory
    ) {
        require(propertyId <= propertyCount && propertyId > 0, "Property does not exist");
        Property memory property = properties[propertyId];
        return (property.name, property.location, property.tokenId, property.isActive, property.imageUrls);
    }

    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        payable(owner()).transfer(balance);
    }
}