// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./RealEstateOracle.sol";
import "./RealEstateToken.sol";

/**
 * @title PropertyAutomation
 * @notice Chainlink Automation contract to automatically update property valuations
 * @dev This contract uses Chainlink Automation to periodically trigger property updates
 */
contract PropertyAutomation is AutomationCompatible, Ownable {
    // Contracts
    RealEstateOracle public immutable realEstateOracle;
    RealEstateToken public immutable realEstateToken;

    // Automation settings
    uint256 public constant UPDATE_INTERVAL = 24 hours;
    uint256 public constant MAX_UPDATES_PER_UPKEEP = 5;

    // State variables
    uint256 public lastUpdateTime;
    uint256 public currentPropertyIndex;
    uint256[] public propertiesToUpdate;

    // Mappings
    mapping(uint256 => uint256) public lastPropertyUpdate;
    mapping(uint256 => bool) public autoUpdateEnabled;

    // Events
    event AutoUpdateEnabled(uint256 indexed propertyId, bool enabled);
    event PropertyUpdateTriggered(
        uint256 indexed propertyId,
        uint256 timestamp
    );
    event AutomationConfigUpdated(uint256 newInterval);

    // Errors
    error PropertyNotFound();
    error UpdateTooSoon();
    error NoPropertiesNeedUpdate();

    constructor(
        address _realEstateOracle,
        address _realEstateToken
    ) Ownable(msg.sender) {
        realEstateOracle = RealEstateOracle(_realEstateOracle);
        realEstateToken = RealEstateToken(_realEstateToken);
        lastUpdateTime = block.timestamp;
    }

    /**
     * @notice Chainlink Automation checkUpkeep function
     * @dev Called by Chainlink nodes to check if upkeep is needed
     * @param checkData Data passed to checkUpkeep (unused)
     * @return upkeepNeeded True if upkeep should be performed
     * @return performData Data to pass to performUpkeep
     */
    function checkUpkeep(
        bytes calldata checkData
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        checkData; // Unused parameter

        // Check if enough time has passed since last update
        if (block.timestamp - lastUpdateTime < UPDATE_INTERVAL) {
            return (false, "");
        }

        // Find properties that need updates
        uint256[] memory propertiesToUpdateNow = getPropertiesNeedingUpdate();

        if (propertiesToUpdateNow.length > 0) {
            upkeepNeeded = true;
            // Limit the number of properties to update in one transaction
            uint256 batchSize = propertiesToUpdateNow.length >
                MAX_UPDATES_PER_UPKEEP
                ? MAX_UPDATES_PER_UPKEEP
                : propertiesToUpdateNow.length;

            uint256[] memory batch = new uint256[](batchSize);
            for (uint256 i = 0; i < batchSize; i++) {
                batch[i] = propertiesToUpdateNow[i];
            }

            performData = abi.encode(batch);
        } else {
            upkeepNeeded = false;
            performData = "";
        }
    }

    /**
     * @notice Chainlink Automation performUpkeep function
     * @dev Called by Chainlink nodes when upkeep is needed
     * @param performData Data from checkUpkeep containing properties to update
     */
    function performUpkeep(bytes calldata performData) external override {
        uint256[] memory propertiesToUpdateNow = abi.decode(
            performData,
            (uint256[])
        );

        if (propertiesToUpdateNow.length == 0) {
            revert NoPropertiesNeedUpdate();
        }

        // Update properties
        for (uint256 i = 0; i < propertiesToUpdateNow.length; i++) {
            uint256 propertyId = propertiesToUpdateNow[i];

            if (shouldUpdateProperty(propertyId)) {
                triggerPropertyUpdate(propertyId);
            }
        }

        lastUpdateTime = block.timestamp;
    }

    /**
     * @notice Enable or disable auto-updates for a property
     * @param propertyId The property ID
     * @param enabled Whether auto-updates should be enabled
     */
    function setAutoUpdateEnabled(uint256 propertyId, bool enabled) external {
        // Check if caller owns tokens or is the owner
        require(
            realEstateToken.balanceOf(msg.sender, propertyId) > 0 ||
                msg.sender == owner(),
            "Only token holders or owner can enable auto-updates"
        );

        autoUpdateEnabled[propertyId] = enabled;
        emit AutoUpdateEnabled(propertyId, enabled);
    }

    /**
     * @notice Get properties that need updates
     * @return Properties that should be updated
     */
    function getPropertiesNeedingUpdate()
        public
        view
        returns (uint256[] memory)
    {
        uint256 totalProperties = realEstateToken.getTotalProperties();
        uint256[] memory needUpdate = new uint256[](totalProperties);
        uint256 count = 0;

        for (uint256 i = 1; i <= totalProperties; i++) {
            if (shouldUpdateProperty(i)) {
                needUpdate[count] = i;
                count++;
            }
        }

        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = needUpdate[i];
        }

        return result;
    }

    /**
     * @notice Check if a property should be updated
     * @param propertyId The property ID to check
     * @return shouldUpdate True if property needs update
     */
    function shouldUpdateProperty(
        uint256 propertyId
    ) public view returns (bool) {
        // Check if property exists
        try realEstateToken.getPropertyInfo(propertyId) returns (
            RealEstateToken.PropertyInfo memory
        ) {
            // Property exists
        } catch {
            return false;
        }

        // Check if auto-update is enabled
        if (!autoUpdateEnabled[propertyId]) {
            return false;
        }

        // Check if enough time has passed since last update
        if (
            block.timestamp - lastPropertyUpdate[propertyId] < UPDATE_INTERVAL
        ) {
            return false;
        }

        // Check if the Oracle can accept requests for this property
        return
            realEstateOracle.canUserRequestValuation(address(this), propertyId);
    }

    /**
     * @notice Trigger property update via Oracle
     * @param propertyId The property ID to update
     */
    function triggerPropertyUpdate(uint256 propertyId) internal {
        try realEstateToken.getPropertyInfo(propertyId) returns (
            RealEstateToken.PropertyInfo memory propertyInfo
        ) {
            // Extract size from description or use default
            string memory size = extractSizeFromDescription(
                propertyInfo.description
            );

            // Trigger Oracle update
            realEstateOracle.requestValuationUpdate(
                propertyId,
                propertyInfo.location,
                size
            );

            lastPropertyUpdate[propertyId] = block.timestamp;
            emit PropertyUpdateTriggered(propertyId, block.timestamp);
        } catch {
            // Property not found or error occurred
            return;
        }
    }

    /**
     * @notice Extract property size from description
     * @param description Property description
     * @return size Property size as string
     */
    function extractSizeFromDescription(
        string memory description
    ) internal pure returns (string memory) {
        // Simple extraction - in production, you'd want more sophisticated parsing
        // For now, return a default size
        return "2000";
    }

    /**
     * @notice Manual trigger for emergency updates (only owner)
     * @param propertyId Property to update immediately
     */
    function manualUpdateProperty(uint256 propertyId) external onlyOwner {
        triggerPropertyUpdate(propertyId);
    }

    /**
     * @notice Get automation status for a property
     * @param propertyId The property ID
     * @return enabled Whether auto-update is enabled
     * @return lastUpdate Timestamp of last update
     * @return nextUpdate Timestamp of next scheduled update
     */
    function getAutomationStatus(
        uint256 propertyId
    )
        external
        view
        returns (bool enabled, uint256 lastUpdate, uint256 nextUpdate)
    {
        enabled = autoUpdateEnabled[propertyId];
        lastUpdate = lastPropertyUpdate[propertyId];
        nextUpdate = lastUpdate + UPDATE_INTERVAL;
    }
}
