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

    string public constant VALUATION_SOURCE = 
        "const location = args[0] || 'Unknown';"
        "const size = args[1] || '2000';"
        "const apiKey = args[2] || '9fa2e8368be548aebeae5566d8d9ac51';"
        "console.log(`Requesting valuation for: ${location}, Size: ${size}`);"
        ""
        "// RentCast API endpoint for property value estimate"
        "const valueUrl = 'https://api.rentcast.io/v1/avm/value';"
        ""
        "try {"
        "  // Parse the location to extract address components"
        "  const addressParts = location.split(',').map(part => part.trim());"
        "  let address, city, state, zipCode;"
        "  if (addressParts.length >= 3) {"
        "    address = addressParts[0];"
        "    city = addressParts[1];"
        "    state = addressParts[2];"
        "    if (addressParts.length >= 4) {"
        "      zipCode = addressParts[3];"
        "    }"
        "  } else {"
        "    address = location;"
        "    city = 'New York';"
        "    state = 'NY';"
        "  }"
        ""
        "  // Build query parameters for RentCast API"
        "  const params = new URLSearchParams({"
        "    address: address,"
        "    city: city,"
        "    state: state"
        "  });"
        "  if (zipCode) params.append('zipCode', zipCode);"
        ""
        "  const sizeNum = parseInt(size, 10);"
        "  if (sizeNum && sizeNum > 0) {"
        "    params.append('squareFootage', sizeNum.toString());"
        "  }"
        ""
        "  const options = {"
        "    method: 'GET',"
        "    headers: {"
        "      'X-Api-Key': apiKey"
        "    }"
        "  };"
        ""
        "  console.log(`Making request to: ${valueUrl}?${params.toString()}`);"
        "  const response = await Functions.makeHttpRequest({"
        "    url: `${valueUrl}?${params.toString()}`,"
        "    ...options"
        "  });"
        ""
        "  if (response.error) {"
        "    console.log(`API Error: ${response.error}`);"
        "    throw new Error(`API request failed: ${response.error}`);"
        "  }"
        ""
        "  const data = response.data;"
        "  console.log(`API Response:`, JSON.stringify(data));"
        ""
        "  let valuation = 0;"
        "  if (data) {"
        "    valuation = data.value || data.price || data.estimate || 0;"
        "    console.log(`Found API valuation: ${valuation}`);"
        "  }"
        ""
        "  // If no valuation found, try property records endpoint as fallback"
        "  if (valuation === 0) {"
        "    console.log('No AVM valuation found, trying property records...');"
        "    const propertiesUrl = 'https://api.rentcast.io/v1/properties';"
        "    const propResponse = await Functions.makeHttpRequest({"
        "      url: `${propertiesUrl}?${params.toString()}`,"
        "      ...options"
        "    });"
        "    "
        "    if (propResponse.data && propResponse.data.length > 0) {"
        "      const property = propResponse.data[0];"
        "      valuation = property.lastSalePrice || property.assessedValue || 0;"
        "      console.log(`Found property record valuation: ${valuation}`);"
        "    }"
        "  }"
        ""
        "  // If still no valuation found, calculate fallback based on size and location"
        "  if (valuation === 0) {"
        "    console.log('No API valuation found, using fallback calculation');"
        "    const sizeNum = parseInt(size, 10) || 2000;"
        "    let basePricePerSqFt = 300;"
        "    if (state === 'CA' || state === 'NY') basePricePerSqFt = 500;"
        "    else if (state === 'TX' || state === 'FL') basePricePerSqFt = 250;"
        "    else if (state === 'OH' || state === 'IN') basePricePerSqFt = 150;"
        "    valuation = Math.floor(sizeNum * basePricePerSqFt);"
        "  }"
        ""
        "  console.log(`Final valuation: ${valuation}`);"
        "  const finalVal = Math.floor(Number(valuation));"
        "  console.log(`Encoded final valuation: ${finalVal}`);"
        "  return Functions.encodeUint256(finalVal);"
        ""
        "} catch (error) {"
        "  console.log(`Error: ${error.message || error}`);"
        "  const sizeNum = parseInt(size, 10) || 2000;"
        "  const fallbackVal = Math.floor(sizeNum * 300);"
        "  console.log(`Using fallback valuation: ${fallbackVal}`);"
        "  return Functions.encodeUint256(fallbackVal);"
        "}";

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
     * @notice Request property valuation update using default API key
     * @param propertyId The ID of the property to update
     * @param location Property location for API query (format: "123 Main St, New York, NY, 10001")
     * @param size Property size in square feet
     */
    function requestValuationUpdate(
        uint256 propertyId,
        string memory location,
        string memory size
    ) external canRequestValuation(propertyId) {
        _requestValuationUpdate(propertyId, location, size, "");
    }

    /**
     * @notice Request property valuation update from off-chain APIs (with custom API key)
     * @param propertyId The ID of the property to update
     * @param location Property location for API query (format: "123 Main St, New York, NY, 10001")
     * @param size Property size in square feet
     * @param apiKey API key for the real estate data provider
     */
    function requestValuationUpdateWithKey(
        uint256 propertyId,
        string memory location,
        string memory size,
        string memory apiKey
    ) external canRequestValuation(propertyId) {
        _requestValuationUpdate(propertyId, location, size, apiKey);
    }

    /**
     * @notice Internal function to request property valuation update
     * @param propertyId The ID of the property to update
     * @param location Property location for API query
     * @param size Property size in square feet
     * @param apiKey API key for the real estate data provider (empty string uses default)
     */
    function _requestValuationUpdate(
        uint256 propertyId,
        string memory location,
        string memory size,
        string memory apiKey
    ) internal {
        // Verify property exists
        try realEstateToken.getPropertyInfo(propertyId) returns (RealEstateToken.PropertyInfo memory) {
            // Property exists, continue
        } catch {
            revert PropertyNotFound();
        }
        
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(VALUATION_SOURCE);
        
        string[] memory args = new string[](3);
        args[0] = location;
        args[1] = size;
        args[2] = apiKey;
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
            // Clean up mappings
            delete requestToPropertyId[requestId];
            delete requestToType[requestId];
            return;
        }

        s_lastResponse = response;
        uint256 propertyId = requestToPropertyId[requestId];
        RequestType requestType = requestToType[requestId];

        // Clean up mappings early to prevent stuck requests
        delete requestToPropertyId[requestId];
        delete requestToType[requestId];

        if (requestType == RequestType.VALUATION_UPDATE && propertyId > 0) {
            uint256 newValuation = abi.decode(response, (uint256));
            
            // Try to get property info and update
            try realEstateToken.getPropertyInfo(propertyId) returns (RealEstateToken.PropertyInfo memory propertyInfo) {
                uint256 oldValuation = propertyInfo.currentValuation;
                realEstateToken.updatePropertyValuation(propertyId, newValuation);
                emit PropertyValuationUpdated(propertyId, oldValuation, newValuation);
            } catch {
                // If property operations fail, emit failure event
                emit RequestFailed(requestId, abi.encode("Property update failed"));
            }
        }
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