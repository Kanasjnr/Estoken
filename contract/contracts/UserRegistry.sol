// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract UserRegistry is Ownable {
    struct User {
        bool isRegistered;
        bool isKYCApproved;
        string kycHash;
    }

    mapping(address => User) public users;

    event UserRegistered(address indexed userAddress);
    event KYCApproved(address indexed userAddress);
    event KYCRevoked(address indexed userAddress);

    constructor() Ownable(msg.sender) {}

    function registerUser() external {
        require(!users[msg.sender].isRegistered, "User already registered");
        users[msg.sender].isRegistered = true;
        emit UserRegistered(msg.sender);
    }

    function approveKYC(address userAddress, string memory kycHash) external onlyOwner {
        require(users[userAddress].isRegistered, "User not registered");
        users[userAddress].isKYCApproved = true;
        users[userAddress].kycHash = kycHash;
        emit KYCApproved(userAddress);
    }

    function revokeKYC(address userAddress) external onlyOwner {
        require(users[userAddress].isKYCApproved, "User not KYC approved");
        users[userAddress].isKYCApproved = false;
        emit KYCRevoked(userAddress);
    }

    function isUserKYCApproved(address userAddress) external view returns (bool) {
        return users[userAddress].isKYCApproved;
    }

    function getUserKYCHash(address userAddress) external view returns (string memory) {
        require(users[userAddress].isKYCApproved, "User not KYC approved");
        return users[userAddress].kycHash;
    }
}