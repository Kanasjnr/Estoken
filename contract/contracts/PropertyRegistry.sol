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
        uint256 listingFee;
        address owner;
    }

    mapping(uint256 => Property) public properties;
    uint256 public propertyCount;

    event PropertyAdded(uint256 indexed propertyId, string name, string location, uint256 tokenId, string[] imageUrls, uint256 listingFee, address owner);
    event PropertyUpdated(uint256 indexed propertyId, string name, string location, bool isActive, string[] imageUrls, uint256 listingFee);
    event FeesCollected(uint256 indexed amount);
    event FeesWithdrawn(address indexed owner, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function addProperty(
        string memory name,
        string memory location,
        uint256 tokenId,
        string[] memory imageUrls,
        uint256 propertyListingFee
    ) public payable {
        require(msg.value == propertyListingFee, "Listing fee must be paid");
        require(imageUrls.length > 0, "At least one image URL must be provided");

        propertyCount++;
        properties[propertyCount] = Property(name, location, tokenId, true, imageUrls, propertyListingFee, msg.sender);

        emit PropertyAdded(propertyCount, name, location, tokenId, imageUrls, propertyListingFee, msg.sender);

        if (msg.value > 0) {
            emit FeesCollected(msg.value);
        }
    }

    function updateProperty(
        uint256 propertyId,
        string memory name,
        string memory location,
        bool isActive
    ) public {
        require(propertyId <= propertyCount && propertyId > 0, "Property does not exist");
        Property storage property = properties[propertyId];
        require(msg.sender == property.owner || msg.sender == owner(), "Not authorized");
        
        property.name = name;
        property.location = location;
        property.isActive = isActive;
        emit PropertyUpdated(propertyId, name, location, isActive, property.imageUrls, property.listingFee);
    }

    function updatePropertyImages(uint256 propertyId, string[] memory newImageUrls) public {
        require(propertyId <= propertyCount && propertyId > 0, "Property does not exist");
        require(newImageUrls.length > 0, "Image URLs array cannot be empty");
        Property storage property = properties[propertyId];
        require(msg.sender == property.owner || msg.sender == owner(), "Not authorized");

        property.imageUrls = newImageUrls;
        emit PropertyUpdated(propertyId, property.name, property.location, property.isActive, newImageUrls, property.listingFee);
    }

    function updateListingFee(uint256 propertyId, uint256 newListingFee) public {
        require(propertyId <= propertyCount && propertyId > 0, "Property does not exist");
        Property storage property = properties[propertyId];
        require(msg.sender == property.owner || msg.sender == owner(), "Not authorized");

        property.listingFee = newListingFee;
        emit PropertyUpdated(propertyId, property.name, property.location, property.isActive, property.imageUrls, newListingFee);
    }

    function getProperty(uint256 propertyId) public view returns (
        string memory,
        string memory,
        uint256,
        bool,
        string[] memory,
        uint256,
        address
    ) {
        require(propertyId <= propertyCount && propertyId > 0, "Property does not exist");
        Property memory property = properties[propertyId];
        require(property.isActive, "Property is not active");
        return (property.name, property.location, property.tokenId, property.isActive, property.imageUrls, property.listingFee, property.owner);
    }
    
    function getAllProperties() public view returns (uint256[] memory) {
        uint256[] memory propertyIds = new uint256[](propertyCount);
        for (uint256 i = 1; i <= propertyCount; i++) {
            propertyIds[i - 1] = i;
        }
        return propertyIds;
    }

    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        payable(owner()).transfer(balance);
        emit FeesWithdrawn(owner(), balance);
    }
}