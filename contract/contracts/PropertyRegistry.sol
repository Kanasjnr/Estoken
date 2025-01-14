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
    }

    mapping(uint256 => Property) public properties;
    uint256 public propertyCount;
    uint256 public defaultListingFee = 0.1 ether; // Default fee, can be overridden per property

    event PropertyAdded(uint256 indexed propertyId, string name, string location, uint256 tokenId, string[] imageUrls, uint256 listingFee);
    event PropertyUpdated(uint256 indexed propertyId, string name, string location, bool isActive, string[] imageUrls, uint256 listingFee);
    event DefaultListingFeeUpdated(uint256 newFee);
    event FeesCollected(uint256 amount);

    constructor() Ownable(msg.sender) {}

    function addProperty(
        string memory name,
        string memory location,
        uint256 tokenId,
        string[] memory imageUrls,
        uint256 propertyListingFee
    ) public payable onlyOwner {
        uint256 requiredFee = propertyListingFee > 0 ? propertyListingFee : defaultListingFee;
        require(msg.value >= requiredFee, "Insufficient listing fee");
        
        propertyCount++;
        properties[propertyCount] = Property(name, location, tokenId, true, imageUrls, requiredFee);
        
        emit PropertyAdded(propertyCount, name, location, tokenId, imageUrls, requiredFee);
        emit FeesCollected(requiredFee);
    }

    function updateProperty(
        uint256 propertyId,
        string memory name,
        string memory location,
        bool isActive,
        uint256 newListingFee
    ) public onlyOwner {
        require(propertyId <= propertyCount && propertyId > 0, "Property does not exist");
        Property storage property = properties[propertyId];
        property.name = name;
        property.location = location;
        property.isActive = isActive;
        if (newListingFee > 0) {
            property.listingFee = newListingFee;
        }
        emit PropertyUpdated(propertyId, name, location, isActive, property.imageUrls, property.listingFee);
    }

    function updatePropertyImages(uint256 propertyId, string[] memory newImageUrls) public onlyOwner {
        require(propertyId <= propertyCount && propertyId > 0, "Property does not exist");
        Property storage property = properties[propertyId];
        property.imageUrls = newImageUrls;
        emit PropertyUpdated(propertyId, property.name, property.location, property.isActive, newImageUrls, property.listingFee);
    }

    function getProperty(uint256 propertyId) public view returns (
        string memory,
        string memory,
        uint256,
        bool,
        string[] memory,
        uint256
    ) {
        require(propertyId <= propertyCount && propertyId > 0, "Property does not exist");
        Property memory property = properties[propertyId];
        return (property.name, property.location, property.tokenId, property.isActive, property.imageUrls, property.listingFee);
    }

    function updateDefaultListingFee(uint256 newFee) external onlyOwner {
        defaultListingFee = newFee;
        emit DefaultListingFeeUpdated(newFee);
    }

    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        payable(owner()).transfer(balance);
    }
}