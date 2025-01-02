// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

contract RentalIncomeDispenser {
    IERC1155 public propertyToken;

    struct RentalIncome {
        uint256 tokenId;
        uint256 totalAmount;
        uint256 totalSupply;
        uint256 claimedAmount;
        uint256 lastDistributionTimestamp;
    }

    mapping(uint256 => RentalIncome) public rentalIncomes;
    mapping(uint256 => mapping(address => uint256)) public claimedIncome;

    event RentalIncomeReceived(uint256 indexed tokenId, uint256 amount);
    event IncomeClaimed(uint256 indexed tokenId, address indexed account, uint256 amount);

    constructor(address _propertyToken) {
        propertyToken = IERC1155(_propertyToken);
    }

    function distributeRentalIncome(uint256 tokenId) external payable {
        require(msg.value > 0, "Must send some ETH");
        RentalIncome storage income = rentalIncomes[tokenId];
        income.totalAmount += msg.value;
        // income.totalSupply = propertyToken.totalSupply(tokenId);
        income.lastDistributionTimestamp = block.timestamp;

        emit RentalIncomeReceived(tokenId, msg.value);
    }

    function claimIncome(uint256 tokenId) external {
        RentalIncome storage income = rentalIncomes[tokenId];
        require(income.totalAmount > 0, "No income to claim");

        uint256 balance = propertyToken.balanceOf(msg.sender, tokenId);
        require(balance > 0, "Must own tokens to claim income");

        uint256 totalUnclaimed = (income.totalAmount * balance / income.totalSupply) - claimedIncome[tokenId][msg.sender];
        require(totalUnclaimed > 0, "No unclaimed income");

        claimedIncome[tokenId][msg.sender] += totalUnclaimed;
        income.claimedAmount += totalUnclaimed;

        payable(msg.sender).transfer(totalUnclaimed);

        emit IncomeClaimed(tokenId, msg.sender, totalUnclaimed);
    }

    function getUnclaimedIncome(uint256 tokenId, address account) public view returns (uint256) {
        RentalIncome storage income = rentalIncomes[tokenId];
        uint256 balance = propertyToken.balanceOf(account, tokenId);
        uint256 totalEarned = income.totalAmount * balance / income.totalSupply;
        return totalEarned - claimedIncome[tokenId][account];
    }
}