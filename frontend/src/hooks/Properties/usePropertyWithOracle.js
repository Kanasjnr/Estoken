"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useAppKitAccount } from "@reown/appkit/react";
import useGetProperty from "./useGetProperty";
import useRequestValuationUpdate from "./useRequestValuationUpdate";
import useOracleEvents from "./useOracleEvents";
import useOracleStatus from "./useOracleStatus";

const usePropertyWithOracle = (propertyId) => {
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(false);
  const [lastOracleUpdate, setLastOracleUpdate] = useState(null);
  const { address, isConnected } = useAppKitAccount();
  
  // Property data
  const { property, loading: propertyLoading, error: propertyError, totalRentalIncome } = useGetProperty(propertyId);
  
  // Oracle hooks
  const { requestValuationUpdate, loading: oracleLoading, error: oracleError } = useRequestValuationUpdate();
  const { events, loading: eventsLoading, refreshEvents } = useOracleEvents();
  const { oracleData, loading: statusLoading, refreshStatus } = useOracleStatus();

  // Filter events for this specific property
  const propertyEvents = events.filter(event => 
    event.args.propertyId && event.args.propertyId.toString() === propertyId?.toString()
  );

  const requestPropertyValuationUpdate = useCallback(async () => {
    if (!property || !address || !isConnected) {
      toast.error("Please ensure you're connected and property is loaded");
      return;
    }

    try {
      // Extract size from property description or use a default
      const size = property.description?.match(/(\d+)\s*sq\s*ft/i)?.[1] || "2000";
      
      const result = await requestValuationUpdate(propertyId, property.location, size);
      
      if (result) {
        setLastOracleUpdate(new Date().toISOString());
        toast.success(`Valuation update requested for ${property.name}`);
        
        // Refresh events and status after request
        setTimeout(() => {
          refreshEvents();
          refreshStatus();
        }, 2000);
      }
      
      return result;
    } catch (error) {
      console.error("Error requesting valuation update:", error);
      throw error;
    }
  }, [property, propertyId, address, isConnected, requestValuationUpdate, refreshEvents, refreshStatus]);

  // Check for recent valuation updates for this property
  useEffect(() => {
    const recentUpdate = propertyEvents
      .filter(event => event.name === 'PropertyValuationUpdated')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    
    if (recentUpdate) {
      setLastOracleUpdate(recentUpdate.timestamp);
    }
  }, [propertyEvents]);

  const getPropertyOracleStatus = useCallback(() => {
    const pendingRequests = propertyEvents.filter(event => 
      event.name === 'PropertyValuationRequested' && 
      !propertyEvents.some(updateEvent => 
        updateEvent.name === 'PropertyValuationUpdated' && 
        updateEvent.args.propertyId?.toString() === event.args.propertyId?.toString() &&
        new Date(updateEvent.timestamp) > new Date(event.timestamp)
      )
    );

    const lastUpdate = propertyEvents
      .filter(event => event.name === 'PropertyValuationUpdated')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

    const failedRequests = propertyEvents.filter(event => event.name === 'RequestFailed');

    return {
      hasPendingRequests: pendingRequests.length > 0,
      pendingRequestsCount: pendingRequests.length,
      lastUpdate: lastUpdate,
      failedRequests: failedRequests,
      canRequestUpdate: pendingRequests.length === 0
    };
  }, [propertyEvents]);

  const shouldAutoUpdate = useCallback(() => {
    if (!autoUpdateEnabled || !property) return false;
    
    const status = getPropertyOracleStatus();
    if (!status.canRequestUpdate) return false;

    // Auto-update if no update in the last 24 hours
    if (status.lastUpdate) {
      const hoursSinceUpdate = (new Date() - new Date(status.lastUpdate.timestamp)) / (1000 * 60 * 60);
      return hoursSinceUpdate >= 24;
    }
    
    return true; // No previous update
  }, [autoUpdateEnabled, property, getPropertyOracleStatus]);

  // Auto-update functionality
  useEffect(() => {
    if (shouldAutoUpdate()) {
      console.log(`Auto-requesting valuation update for property ${propertyId}`);
      requestPropertyValuationUpdate().catch(error => {
        console.error("Auto valuation update failed:", error);
      });
    }
  }, [shouldAutoUpdate, propertyId, requestPropertyValuationUpdate]);

  return {
    // Property data
    property,
    totalRentalIncome,
    propertyLoading,
    propertyError,
    
    // Oracle functionality
    requestPropertyValuationUpdate,
    oracleLoading,
    oracleError,
    
    // Oracle status and events
    oracleData,
    propertyEvents,
    getPropertyOracleStatus,
    lastOracleUpdate,
    
    // Auto-update controls
    autoUpdateEnabled,
    setAutoUpdateEnabled,
    shouldAutoUpdate: shouldAutoUpdate(),
    
    // Loading states
    loading: propertyLoading || oracleLoading || eventsLoading || statusLoading,
    
    // Refresh functions
    refreshEvents,
    refreshStatus
  };
};

export default usePropertyWithOracle; 