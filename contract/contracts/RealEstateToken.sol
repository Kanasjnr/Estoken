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
        uint256 accumulatedRentalIncomePerShare;
        uint256 lastRentalUpdate;
        uint256[] monthlyRentalIncome;
        bool isActive;
    }

    mapping(uint256 => PropertyInfo) private _propertyInfo;
    mapping(uint256 => PropertyFinancials) private _propertyFinancials;
    mapping(uint256 => uint256) private _availableShares;
    mapping(uint256 => mapping(address => uint256)) private _tokenBalances;
    mapping(uint256 => mapping(address => uint256)) private _lastClaimTimestamp;
    
    address public kycManager;

    event PropertyTokenized(uint256 indexed propertyId, string name, string location, uint256 totalShares, uint256 pricePerShare);
    event PropertyUpdated(uint256 indexed propertyId, string name, string location, string description, uint256 pricePerShare, bool isActive);
    event RentalIncomeUpdated(uint256 indexed propertyId, uint256 totalRentalIncome);
    event RentalIncomeClaimed(uint256 indexed propertyId, address indexed account, uint256 amount);
    event TokenSharesPurchased(uint256 indexed propertyId, address indexed buyer, uint256 amount, uint256 totalPrice);
    event SharesLiquidated(uint256 indexed propertyId, address indexed seller, uint256 amount, uint256 totalPrice);

    constructor(
        address _kycManager
    ) ERC1155("https://api.example.com/token/{id}.json") Ownable(msg.sender) {
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
        uint256 initialValuation,
        uint256 totalRentalIncome // Total rental income for a period
    ) public {
        require(isUserVerified(msg.sender), "User must be KYC verified to tokenize property");
        require(imageUrls.length > 0, "At least one image URL is required");
        require(totalShares > 0, "Total shares must be greater than zero");
        require(pricePerShare > 0, "Price per share must be greater than zero");

        uint256 newPropertyId = _nextPropertyId;

        // Store property info
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

        // Store property financials including rental income per share
        _propertyFinancials[newPropertyId] = PropertyFinancials({
            accumulatedRentalIncomePerShare: totalRentalIncome / totalShares, // Rental income per share
            lastRentalUpdate: block.timestamp,
            monthlyRentalIncome: new uint256[](0),
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
    ) public onlyOwner {
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

        _safeTransferFrom(owner(), msg.sender, propertyId, amount, "");
        _availableShares[propertyId] -= amount;

        payable(owner()).transfer(totalPrice);

        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }

        emit TokenSharesPurchased(propertyId, msg.sender, amount, totalPrice);
    }

    function updateRentalIncome(uint256 propertyId, uint256 totalRentalIncome) public onlyOwner {
        require(_propertyExists(propertyId), "Property does not exist");

        PropertyFinancials storage propertyFinancials = _propertyFinancials[propertyId];

        // Update the rental income per share
        propertyFinancials.accumulatedRentalIncomePerShare = totalRentalIncome / _propertyInfo[propertyId].totalShares;
        propertyFinancials.lastRentalUpdate = block.timestamp;

        emit RentalIncomeUpdated(propertyId, totalRentalIncome);
    }

    function claimRentalIncome(uint256 propertyId) public {
        require(_propertyExists(propertyId), "Property does not exist");

        PropertyFinancials storage propertyFinancials = _propertyFinancials[propertyId];

        uint256 lastClaim = _lastClaimTimestamp[propertyId][msg.sender];
        uint256 accumulatedIncome = propertyFinancials.accumulatedRentalIncomePerShare;
        uint256 claimableIncome = accumulatedIncome - (lastClaim);

        require(claimableIncome > 0, "No rental income to claim");

        uint256 platformFee = (claimableIncome * PLATFORM_FEE_PERCENTAGE) / 100;
        uint256 payout = claimableIncome - platformFee;

        _lastClaimTimestamp[propertyId][msg.sender] = propertyFinancials.accumulatedRentalIncomePerShare;

        payable(msg.sender).transfer(payout);

        emit RentalIncomeClaimed(propertyId, msg.sender, payout);
    }

    function calculateRentalIncome(uint256 propertyId, uint256 numberOfShares) public view returns (uint256) {
        require(_propertyExists(propertyId), "Property does not exist");

        PropertyFinancials storage propertyFinancials = _propertyFinancials[propertyId];

        // Rental income per share is already stored as accumulatedRentalIncomePerShare
        uint256 rentalIncomePerShare = propertyFinancials.accumulatedRentalIncomePerShare;

        // Calculate total rental income for the specified number of shares
        uint256 totalRentalIncome = rentalIncomePerShare * numberOfShares;

        return totalRentalIncome;
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

    function updatePropertyValuation(uint256 propertyId, uint256 newValuation) public onlyOwner {
        _propertyInfo[propertyId].currentValuation = newValuation;
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

    function balanceOf(address account, uint256 id) public view virtual override returns (uint256) {
        return _tokenBalances[id][account];
    }

    function getInvestmentPortfolio(address user)
        public
        view
        returns (uint256[] memory propertyIds, uint256[] memory shares)
    {
        uint256 propertyCount = 0;

        for (uint256 i = 1; i < _nextPropertyId; i++) {
            if (_tokenBalances[i][user] > 0) {
                propertyIds[propertyCount] = i;
                shares[propertyCount] = _tokenBalances[i][user];
                propertyCount++;
            }
        }
    }
}
