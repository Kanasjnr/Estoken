// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./PropertyToken.sol";

contract PropertyRegistration {
    PropertyToken public propertyToken;

    struct Property {
        uint256 tokenId;
        string propertyAddress;
        uint256 totalShares;
        uint256 pricePerShare;
        bool isVerified;
    }

    struct User {
        bool isRegistered;
        bool isKYCVerified;
        string kycHash;
    }

    mapping(uint256 => Property) public properties;
    mapping(address => User) public users;
    uint256 public propertyCount;

    event PropertyListed(uint256 indexed tokenId, string propertyAddress, uint256 totalShares, uint256 pricePerShare);
    event PropertyVerified(uint256 indexed tokenId);
    event UserRegistered(address indexed userAddress);
    event UserKYCVerified(address indexed userAddress, string kycHash);

    constructor(address _propertyTokenAddress) {
        require(_propertyTokenAddress != address(0), "Invalid PropertyToken address");
        propertyToken = PropertyToken(_propertyTokenAddress);
    }

    function listProperty(string memory _propertyAddress, uint256 _totalShares, uint256 _pricePerShare) public {
        propertyCount++;
        uint256 tokenId = propertyCount;

        properties[tokenId] = Property({
            tokenId: tokenId,
            propertyAddress: _propertyAddress,
            totalShares: _totalShares,
            pricePerShare: _pricePerShare,
            isVerified: false
        });

        propertyToken.mint(address(this), tokenId, _totalShares, "");

        emit PropertyListed(tokenId, _propertyAddress, _totalShares, _pricePerShare);
    }

    function verifyProperty(uint256 _tokenId) public {
        require(properties[_tokenId].tokenId != 0, "Property does not exist");
        properties[_tokenId].isVerified = true;
        emit PropertyVerified(_tokenId);
    }

    function getProperty(uint256 _tokenId) public view returns (Property memory) {
        return properties[_tokenId];
    }

    function registerUser(address _userAddress) public {
        require(!users[_userAddress].isRegistered, "User already registered");
        users[_userAddress].isRegistered = true;
        emit UserRegistered(_userAddress);
    }

    function verifyKYC(address _userAddress, string memory _kycHash) public {
        require(users[_userAddress].isRegistered, "User not registered");
        users[_userAddress].isKYCVerified = true;
        users[_userAddress].kycHash = _kycHash;
        emit UserKYCVerified(_userAddress, _kycHash);
    }

    function isUserRegistered(address _userAddress) public view returns (bool) {
        return users[_userAddress].isRegistered;
    }

    function isUserKYCVerified(address _userAddress) public view returns (bool) {
        return users[_userAddress].isKYCVerified;
    }
}