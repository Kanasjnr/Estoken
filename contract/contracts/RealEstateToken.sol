// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract RealEstateToken is ERC1155 {
    struct Property {
        string name;
        string location;
        string description;
        string[] imageUrls;
        uint256 totalShares;
        uint256 pricePerShare;
        uint256 accumulatedRentalIncomePerShare;
        uint256 lastRentalUpdate;
        bool isActive;
    }

    struct ListedToken {
        address seller;
        uint256 amount;
        uint256 price;
    }

    mapping(uint256 => Property) private _properties;
    mapping(uint256 => mapping(address => uint256)) private _listedTokens;
    mapping(uint256 => mapping(address => uint256)) private _listedPrices;
    mapping(uint256 => mapping(address => uint256)) private _lastClaimTimestamp;

    uint256 public constant PLATFORM_FEE_PERCENTAGE = 2;
    uint256 private _nextPropertyId = 1;

    address public admin;

    event PropertyTokenized(uint256 indexed propertyId, string name, string location, uint256 totalShares, uint256 pricePerShare);
    event PropertyUpdated(uint256 indexed propertyId, string name, string location, string description, uint256 pricePerShare, bool isActive);
    event RentalIncomeUpdated(uint256 indexed propertyId, uint256 totalRentalIncome);
    event RentalIncomeClaimed(uint256 indexed propertyId, address indexed account, uint256 amount);
    event TokensListed(uint256 indexed propertyId, address indexed seller, uint256 amount, uint256 price);
    event TokensUnlisted(uint256 indexed propertyId, address indexed seller, uint256 amount);
    event TokensSold(uint256 indexed propertyId, address indexed buyer, address indexed seller, uint256 amount, uint256 price);

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

        _properties[newPropertyId] = Property({
            name: name,
            location: location,
            description: description,
            imageUrls: imageUrls,
            totalShares: totalShares,
            pricePerShare: pricePerShare,
            accumulatedRentalIncomePerShare: 0,
            lastRentalUpdate: block.timestamp,
            isActive: true
        });

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

        Property storage property = _properties[propertyId];
        property.name = name;
        property.location = location;
        property.description = description;
        property.pricePerShare = pricePerShare;
        property.isActive = isActive;

        emit PropertyUpdated(propertyId, name, location, description, pricePerShare, isActive);
    }

    function updateRentalIncome(uint256 propertyId, uint256 newRentalIncome) public onlyAdmin {
        require(_propertyExists(propertyId), "Property does not exist");

        Property storage property = _properties[propertyId];
        uint256 incomePerShare = newRentalIncome / property.totalShares;
        property.accumulatedRentalIncomePerShare = property.accumulatedRentalIncomePerShare + incomePerShare;
        property.lastRentalUpdate = block.timestamp;

        emit RentalIncomeUpdated(propertyId, newRentalIncome);
    }

    function claimRentalIncome(uint256 propertyId) public {
        require(_propertyExists(propertyId), "Property does not exist");

        Property storage property = _properties[propertyId];
        uint256 userShares = balanceOf(msg.sender, propertyId);
        require(userShares > 0, "You don't own any shares of this property");

        uint256 lastClaim = _lastClaimTimestamp[propertyId][msg.sender];
        uint256 accumulatedIncome = property.accumulatedRentalIncomePerShare * userShares;
        uint256 claimableIncome = accumulatedIncome - (lastClaim * userShares);

        require(claimableIncome > 0, "No rental income to claim");

        uint256 platformFee = (claimableIncome * PLATFORM_FEE_PERCENTAGE) / 100;
        uint256 payout = claimableIncome - platformFee;

        _lastClaimTimestamp[propertyId][msg.sender] = property.accumulatedRentalIncomePerShare;

        payable(msg.sender).transfer(payout);

        emit RentalIncomeClaimed(propertyId, msg.sender, payout);
    }

    function listTokensForSale(uint256 propertyId, uint256 amount, uint256 price) public {
        require(_propertyExists(propertyId), "Property does not exist");
        require(balanceOf(msg.sender, propertyId) >= amount, "Insufficient tokens");

        _listedTokens[propertyId][msg.sender] = amount;
        _listedPrices[propertyId][msg.sender] = price;
        setApprovalForAll(address(this), true);

        emit TokensListed(propertyId, msg.sender, amount, price);
    }

    function unlistTokens(uint256 propertyId, uint256 amount) public {
        require(_propertyExists(propertyId), "Property does not exist");
        require(_listedTokens[propertyId][msg.sender] >= amount, "Not enough tokens listed");

        _listedTokens[propertyId][msg.sender] = _listedTokens[propertyId][msg.sender] - amount;

        emit TokensUnlisted(propertyId, msg.sender, amount);
    }

    function buyListedTokens(uint256 propertyId, address seller, uint256 amount) public payable {
        require(_propertyExists(propertyId), "Property does not exist");
        require(_listedTokens[propertyId][seller] >= amount, "Not enough tokens listed by seller");
        
        uint256 price = _listedPrices[propertyId][seller];
        uint256 totalPrice = price * amount;
        require(msg.value >= totalPrice, "Insufficient funds sent");

        // Settle rental income for seller before transfer
        _settleRentalIncome(propertyId, seller);

        // Transfer tokens from seller to buyer
        _safeTransferFrom(seller, msg.sender, propertyId, amount, "");

        // Update listed tokens
        _listedTokens[propertyId][seller] = _listedTokens[propertyId][seller] - amount;

        // Transfer funds to seller
        payable(seller).transfer(totalPrice);

        // Refund excess payment to buyer
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }

        // Initialize buyer's last claim timestamp
        Property storage property = _properties[propertyId];
        _lastClaimTimestamp[propertyId][msg.sender] = property.accumulatedRentalIncomePerShare;

        emit TokensSold(propertyId, msg.sender, seller, amount, totalPrice);
    }

    function getProperty(uint256 propertyId) public view returns (
        string memory name,
        string memory location,
        string memory description,
        string[] memory imageUrls,
        uint256 totalShares,
        uint256 pricePerShare,
        uint256 accumulatedRentalIncomePerShare,
        uint256 lastRentalUpdate,
        bool isActive
    ) {
        require(_propertyExists(propertyId), "Property does not exist");

        Property storage property = _properties[propertyId];
        return (
            property.name,
            property.location,
            property.description,
            property.imageUrls,
            property.totalShares,
            property.pricePerShare,
            property.accumulatedRentalIncomePerShare,
            property.lastRentalUpdate,
            property.isActive
        );
    }

    function getAllProperties(uint256 offset, uint256 limit) public view returns (Property[] memory) {
        require(offset < _nextPropertyId, "Offset out of bounds");
        uint256 end = min(_nextPropertyId, offset + limit);
        uint256 length = end - offset;
        Property[] memory properties = new Property[](length);

        for (uint256 i = 0; i < length; i++) {
            properties[i] = _properties[offset + i];
        }

        return properties;
    }

    function getTotalProperties() public view returns (uint256) {
        return _nextPropertyId - 1;
    }

    function getListedTokens(uint256 propertyId) public view returns (ListedToken[] memory) {
        require(_propertyExists(propertyId), "Property does not exist");

        uint256 count = 0;
        for (uint256 i = 1; i < _nextPropertyId; i++) {
            if (_listedTokens[propertyId][address(uint160(i))] > 0) {
                count++;
            }
        }

        ListedToken[] memory listedTokens = new ListedToken[](count);
        uint256 index = 0;

        for (uint256 i = 1; i < _nextPropertyId; i++) {
            address seller = address(uint160(i));
            uint256 amount = _listedTokens[propertyId][seller];
            if (amount > 0) {
                listedTokens[index] = ListedToken({
                    seller: seller,
                    amount: amount,
                    price: _listedPrices[propertyId][seller]
                });
                index++;
            }
        }

        return listedTokens;
    }

    function getRentalIncomeInfo(uint256 propertyId, address user) public view returns (
        uint256 accumulatedRentalIncomePerShare,
        uint256 lastClaimTimestamp,
        uint256 claimableIncome
    ) {
        require(_propertyExists(propertyId), "Property does not exist");

        Property storage property = _properties[propertyId];
        uint256 userShares = balanceOf(user, propertyId);
        uint256 lastClaim = _lastClaimTimestamp[propertyId][user];
        uint256 accumulatedIncome = property.accumulatedRentalIncomePerShare * userShares;
        uint256 claimable = accumulatedIncome - (lastClaim * userShares);

        return (
            property.accumulatedRentalIncomePerShare,
            lastClaim,
            claimable
        );
    }

    function _propertyExists(uint256 propertyId) internal view returns (bool) {
        return propertyId > 0 && propertyId < _nextPropertyId;
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    function _settleRentalIncome(uint256 propertyId, address account) internal {
        Property storage property = _properties[propertyId];
        uint256 userShares = balanceOf(account, propertyId);
        uint256 lastClaim = _lastClaimTimestamp[propertyId][account];
        uint256 accumulatedIncome = property.accumulatedRentalIncomePerShare * userShares;
        uint256 claimableIncome = accumulatedIncome - (lastClaim * userShares);

        if (claimableIncome > 0) {
            uint256 platformFee = (claimableIncome * PLATFORM_FEE_PERCENTAGE) / 100;
            uint256 payout = claimableIncome - platformFee;

            _lastClaimTimestamp[propertyId][account] = property.accumulatedRentalIncomePerShare;

            payable(account).transfer(payout);

            emit RentalIncomeClaimed(propertyId, account, payout);
        }
    }
}
