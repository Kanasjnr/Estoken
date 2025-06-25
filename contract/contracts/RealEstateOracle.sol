// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./RealEstateToken.sol";

/**
 * @title RealEstateOracle
 * @notice Uses Chainlink Functions to fetch real estate data from off-chain APIs
 * @dev This contract integrates with external real estate APIs to update property valuations
 */
contract RealEstateOracle is FunctionsClient, Ownable {
    using FunctionsRequest for FunctionsRequest.Request;

    // Chainlink Functions variables
    bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;
    
    // Subscription ID for Chainlink Functions
    uint64 public s_subscriptionId;
    
    // Gas limit for Functions callback
    uint32 public gasLimit = 300000;
    
    // DON ID for Functions
    bytes32 public donId;
    
    // Reference to the RealEstateToken contract
    RealEstateToken public realEstateToken;
    
    // Mapping to track pending requests
    mapping(bytes32 => uint256) public requestToPropertyId;
    mapping(bytes32 => RequestType) public requestToType;
    
    // Mapping to track request cooldowns
    mapping(uint256 => uint256) public lastRequestTime;
    
    // Cooldown period in seconds (1 hour)
    uint256 public constant REQUEST_COOLDOWN = 3600;
    
    enum RequestType {
        VALUATION_UPDATE,
        RENTAL_INCOME_UPDATE
    }

    // Events
    event PropertyValuationRequested(uint256 indexed propertyId, bytes32 indexed requestId);
    event PropertyValuationUpdated(uint256 indexed propertyId, uint256 oldValuation, uint256 newValuation);
    event RentalIncomeRequested(uint256 indexed propertyId, bytes32 indexed requestId);
    event RentalIncomeUpdated(uint256 indexed propertyId, uint256 oldIncome, uint256 newIncome);
    event RequestFailed(bytes32 indexed requestId, bytes error);

    // Custom errors
    error NotPropertyHolder();
    error RequestTooSoon();
    error PropertyNotFound();

    // JavaScript code to fetch real estate data
    string public constant VALUATION_SOURCE = 
        "const location = args[0];"
        "const size = args[1];"
        "const apiResponse = await Functions.makeHttpRequest({"
        "  url: 'https://api.realestate-data.com/valuation',"
        "  method: 'POST',"
        "  headers: { 'Content-Type': 'application/json' },"
        "  data: { location: location, size: parseInt(size) }"
        "});"
        "if (apiResponse.error) throw Error('Request failed');"
        "const valuation = apiResponse.data.estimated_value || 500000;"
        "return Functions.encodeUint256(Math.floor(valuation));";

    constructor(
        address router,
        bytes32 _donId,
        uint64 _subscriptionId,
        address _realEstateToken
    ) FunctionsClient(router) Ownable(msg.sender) {
        donId = _donId;
        s_subscriptionId = _subscriptionId;
        realEstateToken = RealEstateToken(_realEstateToken);
    }

    /**
     * @notice Check if caller can request valuation updates for a property
     * @param propertyId The property ID to check
     */
    modifier canRequestValuation(uint256 propertyId) {
        // Allow owner or property token holders to request valuation
        if (msg.sender != owner()) {
            uint256 balance = realEstateToken.balanceOf(msg.sender, propertyId);
            if (balance == 0) {
                revert NotPropertyHolder();
            }
        }
        
        // Check cooldown
        if (lastRequestTime[propertyId] + REQUEST_COOLDOWN > block.timestamp) {
            revert RequestTooSoon();
        }
        
        _;
    }

    /**
     * @notice Request property valuation update from off-chain APIs
     * @param propertyId The ID of the property to update
     * @param location Property location for API query
     * @param size Property size in square feet
     */
    function requestValuationUpdate(
        uint256 propertyId,
        string memory location,
        string memory size
    ) external canRequestValuation(propertyId) {
        // Verify property exists
        try realEstateToken.getPropertyInfo(propertyId) returns (RealEstateToken.PropertyInfo memory) {
            // Property exists, continue
        } catch {
            revert PropertyNotFound();
        }
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(VALUATION_SOURCE);
        
        string[] memory args = new string[](2);
        args[0] = location;
        args[1] = size;
        req.setArgs(args);

        s_lastRequestId = _sendRequest(
            req.encodeCBOR(),
            s_subscriptionId,
            gasLimit,
            donId
        );

        requestToPropertyId[s_lastRequestId] = propertyId;
        requestToType[s_lastRequestId] = RequestType.VALUATION_UPDATE;
        lastRequestTime[propertyId] = block.timestamp;

        emit PropertyValuationRequested(propertyId, s_lastRequestId);
    }

    /**
     * @notice Chainlink Functions callback
     * @param requestId The request ID
     * @param response The response from the external API
     * @param err Any error from the request
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        if (err.length > 0) {
            s_lastError = err;
            emit RequestFailed(requestId, err);
            return;
        }

        s_lastResponse = response;
        uint256 propertyId = requestToPropertyId[requestId];
        RequestType requestType = requestToType[requestId];

        if (requestType == RequestType.VALUATION_UPDATE) {
            uint256 newValuation = abi.decode(response, (uint256));
            RealEstateToken.PropertyInfo memory propertyInfo = realEstateToken.getPropertyInfo(propertyId);
            uint256 oldValuation = propertyInfo.currentValuation;
            
            realEstateToken.updatePropertyValuation(propertyId, newValuation);
            emit PropertyValuationUpdated(propertyId, oldValuation, newValuation);
        }
        
        delete requestToPropertyId[requestId];
        delete requestToType[requestId];
    }

    /**
     * @notice Update the subscription ID
     * @param _subscriptionId New subscription ID
     */
    function updateSubscriptionId(uint64 _subscriptionId) external onlyOwner {
        s_subscriptionId = _subscriptionId;
    }

    /**
     * @notice Update the gas limit for Functions requests
     * @param _gasLimit New gas limit
     */
    function updateGasLimit(uint32 _gasLimit) external onlyOwner {
        gasLimit = _gasLimit;
    }

    /**
     * @notice Get the latest response
     * @return The latest response from Chainlink Functions
     */
    function getLatestResponse() external view returns (bytes memory) {
        return s_lastResponse;
    }

    /**
     * @notice Get the latest error
     * @return The latest error from Chainlink Functions
     */
    function getLatestError() external view returns (bytes memory) {
        return s_lastError;
    }

    /**
     * @notice Check if a user can request valuation for a property
     * @param user The user address
     * @param propertyId The property ID
     * @return canRequest True if user can request valuation
     */
    function canUserRequestValuation(address user, uint256 propertyId) external view returns (bool canRequest) {
        if (user == owner()) {
            return true;
        }
        
        uint256 balance = realEstateToken.balanceOf(user, propertyId);
        if (balance == 0) {
            return false;
        }
        
        if (lastRequestTime[propertyId] + REQUEST_COOLDOWN > block.timestamp) {
            return false;
        }
        
        return true;
    }
} 