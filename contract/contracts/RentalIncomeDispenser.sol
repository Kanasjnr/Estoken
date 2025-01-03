// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RentalIncomeDispenser is Ownable, ERC1155Holder {
    IERC1155 public propertyToken;
    uint256 public constant RENTAL_MANAGEMENT_FEE_PERCENTAGE = 2;

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
    event FeesCollected(uint256 amount);

    constructor(address _propertyToken) Ownable(msg.sender) {
        propertyToken = IERC1155(_propertyToken);
    }

    function distributeRentalIncome(uint256 tokenId) external payable {
        require(msg.value > 0, "Must send some ETH");
        RentalIncome storage income = rentalIncomes[tokenId];
        
        uint256 fee = (msg.value * RENTAL_MANAGEMENT_FEE_PERCENTAGE) / 100;
        uint256 netAmount = msg.value - fee;
        
        income.totalAmount += netAmount;
        income.totalSupply = propertyToken.balanceOf(address(this), tokenId);
        require(income.totalSupply > 0, "No tokens minted for this property");
        income.lastDistributionTimestamp = block.timestamp;

        emit RentalIncomeReceived(tokenId, netAmount);
        emit FeesCollected(fee);
    }

    function claimIncome(uint256 tokenId) external {
        RentalIncome storage income = rentalIncomes[tokenId];
        require(income.totalAmount > 0, "No income to claim");
        require(income.totalSupply > 0, "No tokens minted for this property");

        uint256 balance = propertyToken.balanceOf(msg.sender, tokenId);
        // require(balance > 0, "Must own tokens to claim income");

        uint256 totalUnclaimed = (income.totalAmount * balance / income.totalSupply) - claimedIncome[tokenId][msg.sender];
        // require(totalUnclaimed > 0, "No unclaimed income");

        claimedIncome[tokenId][msg.sender] += totalUnclaimed;
        income.claimedAmount += totalUnclaimed;

        payable(msg.sender).transfer(totalUnclaimed);

        emit IncomeClaimed(tokenId, msg.sender, totalUnclaimed);
    }

    function getUnclaimedIncome(uint256 tokenId, address account) public view returns (uint256) {
        RentalIncome storage income = rentalIncomes[tokenId];
        if (income.totalSupply == 0) return 0;
        uint256 balance = propertyToken.balanceOf(account, tokenId);
        uint256 totalEarned = income.totalAmount * balance / income.totalSupply;
        return totalEarned - claimedIncome[tokenId][account];
    }

    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        payable(owner()).transfer(balance);
    }

    function updatePropertyTokenAddress(address _newPropertyToken) external onlyOwner {
        require(_newPropertyToken != address(0), "Invalid address");
        propertyToken = IERC1155(_newPropertyToken);
    }
}

