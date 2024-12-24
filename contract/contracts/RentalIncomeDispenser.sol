// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract RentalIncomeDispenser is Ownable, ReentrancyGuard {
    IERC1155 public propertyToken;

    struct RentalIncome {
        uint256 tokenId;
        uint256 totalAmount;
        uint256 totalShares;
        uint256 claimPeriod;
    }

    mapping(uint256 => RentalIncome) public rentalIncomes;
    mapping(uint256 => mapping(address => bool)) public hasClaimed;

    event RentalIncomeAdded(uint256 indexed tokenId, uint256 amount, uint256 claimPeriod);
    event RentalIncomeClaimed(uint256 indexed tokenId, address indexed claimer, uint256 amount);

    constructor(address _propertyTokenAddress, address initialOwner) Ownable(initialOwner) {
        propertyToken = IERC1155(_propertyTokenAddress);
    }

    function addRentalIncome(uint256 _tokenId, uint256 _totalAmount, uint256 _totalShares) public onlyOwner {
        require(_totalAmount > 0, "Amount must be greater than 0");
        require(_totalShares > 0, "Total shares must be greater than 0");

        uint256 claimPeriod = block.timestamp;
        rentalIncomes[_tokenId] = RentalIncome({
            tokenId: _tokenId,
            totalAmount: _totalAmount,
            totalShares: _totalShares,
            claimPeriod: claimPeriod
        });

        emit RentalIncomeAdded(_tokenId, _totalAmount, claimPeriod);
    }

    function claimRentalIncome(uint256 _tokenId) public nonReentrant {
        RentalIncome storage income = rentalIncomes[_tokenId];
        require(income.totalAmount > 0, "No rental income available");
        require(!hasClaimed[_tokenId][msg.sender], "Already claimed for this period");

        uint256 userShares = propertyToken.balanceOf(msg.sender, _tokenId);
        require(userShares > 0, "No shares owned");

        uint256 userAmount = (income.totalAmount * userShares) / income.totalShares;
        hasClaimed[_tokenId][msg.sender] = true;

        payable(msg.sender).transfer(userAmount);

        emit RentalIncomeClaimed(_tokenId, msg.sender, userAmount);
    }

    receive() external payable {}
}