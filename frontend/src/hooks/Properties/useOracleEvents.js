"use client";

import { useState, useEffect, useCallback } from "react";
import useContract from "../useContract";
import useSignerOrProvider from "../useSignerOrProvider";
import OracleABI from "../../abis/RealEstateOracle.json";

const useOracleEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const contractAddress = import.meta.env.VITE_APP_REAL_ESTATE_ORACLE_ADDRESS;
  const { contract } = useContract(contractAddress, OracleABI);
  const { signer, provider, readOnlyProvider } = useSignerOrProvider();

  const fetchRecentEvents = useCallback(async (fromBlock = -1000) => {
    // Check if we have a contract and at least one provider
    const availableProvider = signer?.provider || provider || readOnlyProvider;
    
    if (!contract || !availableProvider) {
      console.log('Contract or provider not available for events', {
        contract: !!contract,
        signer: !!signer,
        provider: !!provider,
        readOnlyProvider: !!readOnlyProvider,
        contractAddress
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const filter = {
        address: contractAddress,
        fromBlock: fromBlock,
        toBlock: 'latest'
      };

      const logs = await availableProvider.getLogs(filter);
      const parsedEvents = [];

      for (const log of logs) {
        try {
          const parsedLog = contract.interface.parseLog(log);
          parsedEvents.push({
            name: parsedLog.name,
            args: parsedLog.args,
            blockNumber: log.blockNumber,
            transactionHash: log.transactionHash,
            timestamp: new Date().toISOString() // Note: You might want to get actual block timestamp
          });
        } catch (parseError) {
          console.log('Could not parse log:', parseError);
        }
      }

      setEvents(parsedEvents.reverse()); // Most recent first
    } catch (err) {
      // Suppress filter not found errors as they're common with RPC provider filter cleanup
      if (err.message?.includes('filter not found') || err.code === 'UNKNOWN_ERROR') {
        console.log('Filter expired or not found, this is normal. Retrying...');
        // Don't set error state for this common issue
        return;
      }
      console.error("Error fetching oracle events:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [contract, contractAddress, signer, provider, readOnlyProvider]);

  const setupEventListeners = useCallback(() => {
    if (!contract) {
      console.log('Contract not available for event listeners');
      return;
    }

    const handlePropertyValuationRequested = (propertyId, requestId, event) => {
      const newEvent = {
        name: 'PropertyValuationRequested',
        args: { propertyId, requestId },
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        timestamp: new Date().toISOString()
      };
      setEvents(prev => [newEvent, ...prev]);
    };

    const handlePropertyValuationUpdated = (propertyId, oldValuation, newValuation, event) => {
      const newEvent = {
        name: 'PropertyValuationUpdated',
        args: { propertyId, oldValuation, newValuation },
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        timestamp: new Date().toISOString()
      };
      setEvents(prev => [newEvent, ...prev]);
    };

    const handleRequestFailed = (requestId, error, event) => {
      const newEvent = {
        name: 'RequestFailed',
        args: { requestId, error },
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        timestamp: new Date().toISOString()
      };
      setEvents(prev => [newEvent, ...prev]);
    };

    // Error handler for all events
    const handleError = (error) => {
      // Suppress filter not found errors as they're common with RPC provider filter cleanup
      if (error.message?.includes('filter not found') || error.code === 'UNKNOWN_ERROR') {
        console.log('Filter expired or not found, this is normal for oracle events.');
        return;
      }
      console.error('Error in oracle event listener:', error);
    };

    try {
      // Set up event listeners
      contract.on('PropertyValuationRequested', handlePropertyValuationRequested);
      contract.on('PropertyValuationUpdated', handlePropertyValuationUpdated);
      contract.on('RequestFailed', handleRequestFailed);
      contract.on('error', handleError);

      // Cleanup function
      return () => {
        contract.off('PropertyValuationRequested', handlePropertyValuationRequested);
        contract.off('PropertyValuationUpdated', handlePropertyValuationUpdated);
        contract.off('RequestFailed', handleRequestFailed);
        contract.off('error', handleError);
      };
    } catch (error) {
      console.error('Error setting up oracle event listeners:', error);
      return () => {};
    }
  }, [contract]);

  useEffect(() => {
    let cleanup;
    
    if (contract && (signer || provider || readOnlyProvider)) {
      cleanup = setupEventListeners();
      fetchRecentEvents();
    }

    return cleanup;
  }, [contract, signer, provider, readOnlyProvider, setupEventListeners, fetchRecentEvents]);

  return { 
    events, 
    loading, 
    error, 
    refreshEvents: () => fetchRecentEvents()
  };
};

export default useOracleEvents; 