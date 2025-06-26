import { useState, useEffect, useCallback } from 'react';
import useContract from '../useContract';
import useSignerOrProvider from '../useSignerOrProvider';
import PropertyAutomationABI from '../../abis/PropertyAutomation.json';

const useAutomationEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { provider } = useSignerOrProvider();
  const contractAddress = import.meta.env.VITE_APP_PROPERTY_AUTOMATION_ADDRESS;
  const { contract } = useContract(contractAddress, PropertyAutomationABI);

  // Fetch historical events
  const fetchEvents = useCallback(async (fromBlock = 'earliest', toBlock = 'latest') => {
    if (!contract || !provider) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const filter = {
        address: contractAddress,
        fromBlock,
        toBlock
      };

      const logs = await provider.getLogs(filter);
      const decodedEvents = logs.map(log => {
        try {
          const decoded = contract.interface.parseLog(log);
          return {
            ...decoded,
            blockNumber: log.blockNumber,
            transactionHash: log.transactionHash,
            timestamp: Date.now() // Will need to fetch actual timestamp from block
          };
        } catch (err) {
          console.error('Error decoding log:', err);
          return null;
        }
      }).filter(Boolean);

      setEvents(decodedEvents);
      return decodedEvents;
    } catch (err) {
      // Suppress filter not found errors as they're common with RPC provider filter cleanup
      if (err.message?.includes('filter not found') || err.code === 'UNKNOWN_ERROR') {
        console.log('Filter expired or not found, this is normal. Retrying...');
        // Don't set error state for this common issue
        return;
      }
      console.error('Error fetching automation events:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract, provider, contractAddress]);

  // Listen for new events
  const startEventListener = useCallback(() => {
    if (!contract) {
      return;
    }

    const handleAutoUpdateEnabled = (propertyId, enabled, event) => {
      const newEvent = {
        name: 'AutoUpdateEnabled',
        args: { propertyId: propertyId.toString(), enabled },
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        timestamp: Date.now()
      };
      setEvents(prev => [newEvent, ...prev]);
    };

    const handlePropertyUpdateTriggered = (propertyId, timestamp, event) => {
      const newEvent = {
        name: 'PropertyUpdateTriggered',
        args: { propertyId: propertyId.toString(), timestamp: timestamp.toString() },
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        timestamp: Date.now()
      };
      setEvents(prev => [newEvent, ...prev]);
    };

    const handleAutomationConfigUpdated = (newInterval, event) => {
      const newEvent = {
        name: 'AutomationConfigUpdated',
        args: { newInterval: newInterval.toString() },
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        timestamp: Date.now()
      };
      setEvents(prev => [newEvent, ...prev]);
    };

    // Error handler for all events
    const handleError = (error) => {
      // Suppress filter not found errors as they're common with RPC provider filter cleanup
      if (error.message?.includes('filter not found') || error.code === 'UNKNOWN_ERROR') {
        console.log('Filter expired or not found, this is normal for automation events.');
        return;
      }
      console.error('Error in automation event listener:', error);
    };

    try {
      // Set up event listeners
      contract.on('AutoUpdateEnabled', handleAutoUpdateEnabled);
      contract.on('PropertyUpdateTriggered', handlePropertyUpdateTriggered);
      contract.on('AutomationConfigUpdated', handleAutomationConfigUpdated);
      contract.on('error', handleError);

      // Return cleanup function
      return () => {
        contract.off('AutoUpdateEnabled', handleAutoUpdateEnabled);
        contract.off('PropertyUpdateTriggered', handlePropertyUpdateTriggered);
        contract.off('AutomationConfigUpdated', handleAutomationConfigUpdated);
        contract.off('error', handleError);
      };
    } catch (error) {
      console.error('Error setting up automation event listeners:', error);
      return () => {};
    }
  }, [contract]);

  // Filter events by type
  const getEventsByType = useCallback((eventType) => {
    return events.filter(event => event.name === eventType);
  }, [events]);

  // Filter events by property ID
  const getEventsByProperty = useCallback((propertyId) => {
    return events.filter(event => 
      event.args && event.args.propertyId === propertyId.toString()
    );
  }, [events]);

  useEffect(() => {
    const cleanup = startEventListener();
    return cleanup;
  }, [startEventListener]);

  return {
    events,
    loading,
    error,
    fetchEvents,
    getEventsByType,
    getEventsByProperty
  };
};

export default useAutomationEvents; 