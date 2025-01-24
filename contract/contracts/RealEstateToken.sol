// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract RealEstateToken is ERC1155 {
    struct PropertyInfo {
        string name;
        string location;
        string description;
        string[] imageUrls;
        uint256 totalShares;
        uint256 pricePerShare;
    }

    struct PropertyFinancials {
        uint256 accumulatedRentalIncomePerShare;
        uint256 lastRentalUpdate;
        bool isActive;
    }

    mapping(uint256 => PropertyInfo) private _propertyInfo;
    mapping(uint256 => PropertyFinancials) private _propertyFinancials;
    mapping(uint256 => uint256) private _availableShares;
    mapping(uint256 => mapping(address => uint256)) private _lastClaimTimestamp;

    uint256 public constant PLATFORM_FEE_PERCENTAGE = 2;
    uint256 private _nextPropertyId = 1;

    address public admin;

    event PropertyTokenized(uint256 indexed propertyId, string name, string location, uint256 totalShares, uint256 pricePerShare);
    event PropertyUpdated(uint256 indexed propertyId, string name, string location, string description, uint256 pricePerShare, bool isActive);
    event RentalIncomeUpdated(uint256 indexed propertyId, uint256 totalRentalIncome);
    event RentalIncomeClaimed(uint256 indexed propertyId, address indexed account, uint256 amount);
    event TokenSharesPurchased(uint256 indexed propertyId, address indexed buyer, uint256 amount, uint256 totalPrice);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not authorized");
        _;
    }

    constructor() ERC1155("https://api.example.com/token/{id}.json") {
        admin = msg.sender;
    }

    function tokenizeProperty(
        string memory name,
        string memory location,
        string memory description,
        string[] memory imageUrls,
        uint256 totalShares,
        uint256 pricePerShare
    ) public onlyAdmin {
        require(imageUrls.length > 0, "At least one image URL is required");
        require(totalShares > 0, "Total shares must be greater than zero");
        require(pricePerShare > 0, "Price per share must be greater than zero");

        uint256 newPropertyId = _nextPropertyId;

        _propertyInfo[newPropertyId] = PropertyInfo({
            name: name,
            location: location,
            description: description,
            imageUrls: imageUrls,
            totalShares: totalShares,
            pricePerShare: pricePerShare
        });

        _propertyFinancials[newPropertyId] = PropertyFinancials({
            accumulatedRentalIncomePerShare: 0,
            lastRentalUpdate: block.timestamp,
            isActive: true
        });

        _availableShares[newPropertyId] = totalShares;
        _mint(msg.sender, newPropertyId, totalShares, "");

        emit PropertyTokenized(newPropertyId, name, location, totalShares, pricePerShare);

        _nextPropertyId++;
    }

    function updateProperty(
        uint256 propertyId,
        string memory name,
        string memory location,
        string memory description,
        uint256 pricePerShare,
        bool isActive
    ) public onlyAdmin {
        require(_propertyExists(propertyId), "Property does not exist");

        PropertyInfo storage propertyInfo = _propertyInfo[propertyId];
        PropertyFinancials storage propertyFinancials = _propertyFinancials[propertyId];

        propertyInfo.name = name;
        propertyInfo.location = location;
        propertyInfo.description = description;
        propertyInfo.pricePerShare = pricePerShare;
        propertyFinancials.isActive = isActive;

        emit PropertyUpdated(propertyId, name, location, description, pricePerShare, isActive);
    }

    function buyTokenShares(uint256 propertyId, uint256 amount) public payable {
        require(_propertyExists(propertyId), "Property does not exist");
        require(amount > 0, "Amount must be greater than zero");

        PropertyInfo storage propertyInfo = _propertyInfo[propertyId];
        PropertyFinancials storage propertyFinancials = _propertyFinancials[propertyId];
        require(propertyFinancials.isActive, "Property is not active");
        require(_availableShares[propertyId] >= amount, "Not enough shares available");

        uint256 totalPrice = amount * propertyInfo.pricePerShare;
        require(msg.value >= totalPrice, "Insufficient funds sent");

        _settleRentalIncome(propertyId, msg.sender);

        _safeTransferFrom(admin, msg.sender, propertyId, amount, "");
        _availableShares[propertyId] -= amount;

        payable(admin).transfer(totalPrice);

        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }

        emit TokenSharesPurchased(propertyId, msg.sender, amount, totalPrice);
    }

    function updateRentalIncome(uint256 propertyId, uint256 newRentalIncome) public onlyAdmin {
        require(_propertyExists(propertyId), "Property does not exist");

        PropertyInfo storage propertyInfo = _propertyInfo[propertyId];
        PropertyFinancials storage propertyFinancials = _propertyFinancials[propertyId];

        uint256 incomePerShare = newRentalIncome / propertyInfo.totalShares;
        propertyFinancials.accumulatedRentalIncomePerShare += incomePerShare;
        propertyFinancials.lastRentalUpdate = block.timestamp;

        emit RentalIncomeUpdated(propertyId, newRentalIncome);
    }

    function claimRentalIncome(uint256 propertyId) public {
        require(_propertyExists(propertyId), "Property does not exist");

        PropertyInfo storage propertyInfo = _propertyInfo[propertyId];
        PropertyFinancials storage propertyFinancials = _propertyFinancials[propertyId];

        uint256 userShares = balanceOf(msg.sender, propertyId);
        require(userShares > 0, "You don't own any shares of this property");

        uint256 lastClaim = _lastClaimTimestamp[propertyId][msg.sender];
        uint256 accumulatedIncome = propertyFinancials.accumulatedRentalIncomePerShare * userShares;
        uint256 claimableIncome = accumulatedIncome - (lastClaim * userShares);

        require(claimableIncome > 0, "No rental income to claim");

        uint256 platformFee = (claimableIncome * PLATFORM_FEE_PERCENTAGE) / 100;
        uint256 payout = claimableIncome - platformFee;

        _lastClaimTimestamp[propertyId][msg.sender] = propertyFinancials.accumulatedRentalIncomePerShare;

        payable(msg.sender).transfer(payout);

        emit RentalIncomeClaimed(propertyId, msg.sender, payout);
    }

    function getPropertyInfo(uint256 propertyId) public view returns (PropertyInfo memory) {
        require(_propertyExists(propertyId), "Property does not exist");
        return _propertyInfo[propertyId];
    }

    function getPropertyFinancials(uint256 propertyId) public view returns (PropertyFinancials memory) {
        require(_propertyExists(propertyId), "Property does not exist");
        return _propertyFinancials[propertyId];
    }

    function getAvailableShares(uint256 propertyId) public view returns (uint256) {
        require(_propertyExists(propertyId), "Property does not exist");
        return _availableShares[propertyId];
    }

    function getTotalProperties() public view returns (uint256) {
        return _nextPropertyId - 1;
    }

    function _propertyExists(uint256 propertyId) internal view returns (bool) {
        return propertyId > 0 && propertyId < _nextPropertyId;
    }

    function _settleRentalIncome(uint256 propertyId, address account) internal {
        PropertyFinancials storage propertyFinancials = _propertyFinancials[propertyId];
        uint256 userShares = balanceOf(account, propertyId);
        uint256 lastClaim = _lastClaimTimestamp[propertyId][account];
        uint256 accumulatedIncome = propertyFinancials.accumulatedRentalIncomePerShare * userShares;
        uint256 claimableIncome = accumulatedIncome - (lastClaim * userShares);

        if (claimableIncome > 0) {
            uint256 platformFee = (claimableIncome * PLATFORM_FEE_PERCENTAGE) / 100;
            uint256 payout = claimableIncome - platformFee;

            _lastClaimTimestamp[propertyId][account] = propertyFinancials.accumulatedRentalIncomePerShare;

            payable(account).transfer(payout);

            emit RentalIncomeClaimed(propertyId, account, payout);
        }
    }
}

