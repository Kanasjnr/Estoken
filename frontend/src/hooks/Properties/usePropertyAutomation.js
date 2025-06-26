import { useState, useCallback } from 'react';
import useContract from '../useContract';
import useSignerOrProvider from '../useSignerOrProvider';
import PropertyAutomationABI from '../../abis/PropertyAutomation.json';

const usePropertyAutomation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { signer } = useSignerOrProvider();
  const contractAddress = import.meta.env.VITE_APP_PROPERTY_AUTOMATION_ADDRESS;
  const { contract } = useContract(contractAddress, PropertyAutomationABI);

  // Enable/disable auto-updates for a property
  const setAutoUpdateEnabled = useCallback(async (propertyId, enabled) => {
    if (!contract || !signer) {
      throw new Error('Contract or signer not available');
    }

    setLoading(true);
    setError(null);

    try {
      const tx = await contract.setAutoUpdateEnabled(propertyId, enabled);
      await tx.wait();
      return tx;
    } catch (err) {
      console.error('Error setting auto-update:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract, signer]);

  // Check if auto-updates are enabled for a property
  const isAutoUpdateEnabled = useCallback(async (propertyId) => {
    if (!contract) {
      throw new Error('Contract not available');
    }

    try {
      const enabled = await contract.autoUpdateEnabled(propertyId);
      return enabled;
    } catch (err) {
      console.error('Error checking auto-update status:', err);
      throw err;
    }
  }, [contract]);

  // Get properties that need updates
  const getPropertiesNeedingUpdate = useCallback(async () => {
    if (!contract) {
      throw new Error('Contract not available');
    }

    try {
      const properties = await contract.getPropertiesNeedingUpdate();
      return properties.map(id => id.toString());
    } catch (err) {
      console.error('Error getting properties needing update:', err);
      throw err;
    }
  }, [contract]);

  // Check if a property should be updated
  const shouldUpdateProperty = useCallback(async (propertyId) => {
    if (!contract) {
      throw new Error('Contract not available');
    }

    try {
      const shouldUpdate = await contract.shouldUpdateProperty(propertyId);
      return shouldUpdate;
    } catch (err) {
      console.error('Error checking if property should update:', err);
      throw err;
    }
  }, [contract]);

  // Get automation configuration
  const getAutomationConfig = useCallback(async () => {
    if (!contract) {
      throw new Error('Contract not available');
    }

    try {
      const [updateInterval, maxUpdatesPerUpkeep, lastUpdateTime] = await Promise.all([
        contract.UPDATE_INTERVAL(),
        contract.MAX_UPDATES_PER_UPKEEP(),
        contract.lastUpdateTime()
      ]);

      return {
        updateInterval: updateInterval.toString(),
        maxUpdatesPerUpkeep: maxUpdatesPerUpkeep.toString(),
        lastUpdateTime: lastUpdateTime.toString()
      };
    } catch (err) {
      console.error('Error getting automation config:', err);
      throw err;
    }
  }, [contract]);

  return {
    loading,
    error,
    setAutoUpdateEnabled,
    isAutoUpdateEnabled,
    getPropertiesNeedingUpdate,
    shouldUpdateProperty,
    getAutomationConfig
  };
};

export default usePropertyAutomation; 