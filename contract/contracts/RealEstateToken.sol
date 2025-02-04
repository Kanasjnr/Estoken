// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./KYCManager.sol";

contract RealEstateToken is ERC1155, Ownable {
    uint256 public constant PLATFORM_FEE_PERCENTAGE = 2;
    uint256 private _nextPropertyId = 1;

    struct PropertyInfo {
        string name;
        string location;
        string description;
        string[] imageUrls;
        uint256 totalShares;
        uint256 pricePerShare;
        uint256 initialValuation;
        uint256 currentValuation;
        uint256 creationTimestamp;
    }

    struct PropertyFinancials {
        uint256 totalRentalIncome;
        uint256 rentalIncomePerShare;
        uint256 lastRentalUpdate;
        uint256 lastDistributionTimestamp;
        bool isActive;
        uint256 totalExpenses;
        uint256[] monthlyRentalIncome;
        uint256 totalShares;
    }

    mapping(uint256 => PropertyInfo) private _propertyInfo;
    mapping(uint256 => PropertyFinancials) private _propertyFinancials;
    mapping(uint256 => uint256) private _availableShares;
    mapping(uint256 => mapping(address => uint256)) private _unclaimedRentalIncome;
    mapping(uint256 => mapping(address => uint256)) private _tokenBalances;
    mapping(address => uint256[]) private _userProperties;

    address public kycManager;

    event PropertyTokenized(
        uint256 indexed propertyId,
        string name,
        string location,
        uint256 totalShares,
        uint256 pricePerShare,
        uint256 initialValuation
    );
    event TokenSharesPurchased(
        uint256 indexed propertyId,
        address indexed buyer,
        uint256 amount,
        uint256 totalPrice
    );
    event RentalIncomeClaimed(
        address indexed account,
        uint256 indexed propertyId,
        uint256 amount
    );
    event SharesLiquidated(
        uint256 indexed propertyId,
        address indexed seller,
        uint256 amount,
        uint256 totalPrice
    );
    event RentalIncomeUpdated(
        uint256 indexed propertyId,
        uint256 totalRentalIncome
    );
    event RentalIncomeDistributed(
        uint256 indexed propertyId,
        uint256 totalAmount
    );

    constructor(address _kycManager)
        ERC1155("https://api.example.com/token/{id}.json")
        Ownable(msg.sender)
    {
        kycManager = _kycManager;
    }

    function isUserVerified(address user) public view returns (bool) {
        return KYCManager(kycManager).isUserVerified(user);
    }

    function tokenizeProperty(
        string memory name,
        string memory location,
        string memory description,
        string[] memory imageUrls,
        uint256 totalShares,
        uint256 pricePerShare,
        uint256 initialValuation
    ) public {
        require(
            isUserVerified(msg.sender),
            "User must be KYC verified to tokenize property"
        );
        uint256 newPropertyId = _nextPropertyId;
        _propertyInfo[newPropertyId] = PropertyInfo({
            name: name,
            location: location,
            description: description,
            imageUrls: imageUrls,
            totalShares: totalShares,
            pricePerShare: pricePerShare,
            initialValuation: initialValuation,
            currentValuation: initialValuation,
            creationTimestamp: block.timestamp
        });

        _propertyFinancials[newPropertyId] = PropertyFinancials({
            totalRentalIncome: 0,
            rentalIncomePerShare: 0,
            lastRentalUpdate: block.timestamp,
            lastDistributionTimestamp: block.timestamp,
            isActive: true,
            totalExpenses: 0,
            monthlyRentalIncome: new uint256[](0),
            totalShares: totalShares
        });

        _availableShares[newPropertyId] = totalShares;
        _mint(msg.sender, newPropertyId, totalShares, "");
        updateTokenBalance(newPropertyId, msg.sender, totalShares, true);

        emit PropertyTokenized(
            newPropertyId,
            name,
            location,
            totalShares,
            pricePerShare,
            initialValuation
        );

        _nextPropertyId++;
    }

    function buyTokenShares(uint256 propertyId, uint256 amount) public payable {
        require(
            isUserVerified(msg.sender),
            "User must be KYC verified to buy shares"
        );
        (uint256 totalPrice, uint256 availableShares) = calculatePurchase(
            propertyId,
            amount
        );
        require(msg.value >= totalPrice, "Insufficient funds sent");
        require(availableShares >= amount, "Not enough shares available");

        distributeRentalIncome(propertyId);
        safeTransferFrom(address(this), msg.sender, propertyId, amount, "");
        updateAvailableShares(propertyId, amount);
        updateUnclaimedRentalIncome(propertyId, msg.sender, amount);

        if (!_userOwnsProperty(msg.sender, propertyId)) {
            _userProperties[msg.sender].push(propertyId);
        }

        payable(owner()).transfer(totalPrice);
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }

        emit TokenSharesPurchased(propertyId, msg.sender, amount, totalPrice);
    }

    function claimRentalIncome(uint256 propertyId) public {
        require(
            balanceOf(msg.sender, propertyId) > 0,
            "User does not own shares of this property"
        );
        distributeRentalIncome(propertyId);
        uint256 unclaimedIncome = getUnclaimedRentalIncome(
            propertyId,
            msg.sender
        );
        require(unclaimedIncome > 0, "No rental income to claim");
        _unclaimedRentalIncome[propertyId][msg.sender] = 0;
        payable(msg.sender).transfer(unclaimedIncome);
        emit RentalIncomeClaimed(msg.sender, propertyId, unclaimedIncome);
    }

    function liquidateShares(uint256 propertyId, uint256 amount) public {
        require(
            balanceOf(msg.sender, propertyId) >= amount,
            "Insufficient shares to liquidate"
        );
        uint256 totalPrice = calculateLiquidationPrice(propertyId, amount);
        safeTransferFrom(msg.sender, address(this), propertyId, amount, "");
        updateAvailableShares(propertyId, amount);
        payable(msg.sender).transfer(totalPrice);

        if (balanceOf(msg.sender, propertyId) == 0) {
            _removePropertyFromUser(msg.sender, propertyId);
        }

        emit SharesLiquidated(propertyId, msg.sender, amount, totalPrice);
    }

    function calculatePurchase(uint256 propertyId, uint256 amount)
        public
        view
        returns (uint256, uint256)
    {
        PropertyInfo storage propertyInfo = _propertyInfo[propertyId];
        uint256 totalPrice = amount * propertyInfo.pricePerShare;
        return (totalPrice, _availableShares[propertyId]);
    }

    function updateAvailableShares(uint256 propertyId, uint256 amount)
        internal
    {
        _availableShares[propertyId] -= amount;
    }

    function calculateLiquidationPrice(uint256 propertyId, uint256 amount)
        public
        view
        returns (uint256)
    {
        PropertyInfo storage property = _propertyInfo[propertyId];
        return (amount * property.currentValuation) / property.totalShares;
    }

    function getPropertyInfo(uint256 propertyId)
        public
        view
        returns (
            string memory name,
            string memory location,
            uint256 totalShares,
            uint256 pricePerShare
        )
    {
        PropertyInfo storage property = _propertyInfo[propertyId];
        return (
            property.name,
            property.location,
            property.totalShares,
            property.pricePerShare
        );
    }

    function updatePropertyValuation(uint256 propertyId, uint256 newValuation)
        public
        onlyOwner
    {
        _propertyInfo[propertyId].currentValuation = newValuation;
    }

    function updateRentalIncome(uint256 propertyId, uint256 newRentalIncome)
        public
        onlyOwner
    {
        PropertyFinancials storage financials = _propertyFinancials[propertyId];
        require(financials.isActive, "Property is not active");

        uint256 rentalIncrease = newRentalIncome - financials.totalRentalIncome;
        financials.totalRentalIncome = newRentalIncome;

        uint256 increasePerShare = (rentalIncrease * 1e18) / financials.totalShares;
        financials.rentalIncomePerShare += increasePerShare;

        financials.lastRentalUpdate = block.timestamp;
        financials.monthlyRentalIncome.push(newRentalIncome);

        emit RentalIncomeUpdated(propertyId, newRentalIncome);
    }

    function distributeRentalIncome(uint256 propertyId) public {
        PropertyFinancials storage financials = _propertyFinancials[propertyId];
        require(financials.isActive, "Property is not active");

        uint256 totalDistribution = financials.totalRentalIncome -
            (financials.rentalIncomePerShare * financials.totalShares) / 1e18;
        if (totalDistribution > 0) {
            financials.rentalIncomePerShare +=
                (totalDistribution * 1e18) /
                financials.totalShares;

            financials.lastDistributionTimestamp = block.timestamp;

            emit RentalIncomeDistributed(propertyId, totalDistribution);
        }
    }

    function updateUnclaimedRentalIncome(
        uint256 propertyId,
        address user,
        uint256 amount
    ) internal {
        PropertyFinancials storage financials = _propertyFinancials[propertyId];
        _unclaimedRentalIncome[propertyId][user] += (amount * financials.rentalIncomePerShare) / 1e18;
    }

    function getUnclaimedRentalIncome(uint256 propertyId, address user)
        public
        view
        returns (uint256)
    {
        PropertyFinancials storage financials = _propertyFinancials[propertyId];
        uint256 totalIncome = (balanceOf(user, propertyId) *
            financials.rentalIncomePerShare) / 1e18;
        return totalIncome - _unclaimedRentalIncome[propertyId][user];
    }

    function getFinancialReport(uint256 propertyId)
        public
        view
        returns (
            uint256 totalRentalIncome,
            uint256 totalExpenses,
            uint256 netIncome,
            uint256 currentValuation
        )
    {
        PropertyFinancials storage financials = _propertyFinancials[propertyId];
        PropertyInfo storage property = _propertyInfo[propertyId];
        return (
            financials.totalRentalIncome,
            financials.totalExpenses,
            financials.totalRentalIncome - financials.totalExpenses,
            property.currentValuation
        );
    }

    function updateTokenBalance(
        uint256 propertyId,
        address account,
        uint256 amount,
        bool isIncrease
    ) internal {
        if (isIncrease) {
            _tokenBalances[propertyId][account] += amount;
        } else {
            require(
                _tokenBalances[propertyId][account] >= amount,
                "Insufficient balance"
            );
            _tokenBalances[propertyId][account] -= amount;
        }
    }

    function balanceOf(address account, uint256 id)
        public
        view
        virtual
        override
        returns (uint256)
    {
        return _tokenBalances[id][account];
    }

    function getUserProperties(address user) public view returns (uint256[] memory) {
        return _userProperties[user];
    }

    function getAllProperties() public view returns (uint256[] memory) {
        uint256[] memory allProperties = new uint256[](_nextPropertyId - 1);
        for (uint256 i = 1; i < _nextPropertyId; i++) {
            allProperties[i - 1] = i;
        }
        return allProperties;
    }

    function _userOwnsProperty(address user, uint256 propertyId) internal view returns (bool) {
        uint256[] memory userProps = _userProperties[user];
        for (uint256 i = 0; i < userProps.length; i++) {
            if (userProps[i] == propertyId) {
                return true;
            }
        }
        return false;
    }

    function _removePropertyFromUser(address user, uint256 propertyId) internal {
        uint256[] storage userProps = _userProperties[user];
        for (uint256 i = 0; i < userProps.length; i++) {
            if (userProps[i] == propertyId) {
                userProps[i] = userProps[userProps.length - 1];
                userProps.pop();
                break;
            }
        }
    }
}