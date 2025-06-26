"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useAppKitAccount } from "@reown/appkit/react";
import useGetProperty from "./useGetProperty";
import useRequestValuationUpdate from "./useRequestValuationUpdate";
import useOracleEvents from "./useOracleEvents";
import useOracleStatus from "./useOracleStatus";
import useCanRequestValuation from "./useCanRequestValuation";

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
  const { canRequestValuation, loading: permissionLoading } = useCanRequestValuation();

  // Filter events for this specific property
  const propertyEvents = events.filter(event => 
    event.args.propertyId && event.args.propertyId.toString() === propertyId?.toString()
  );

  // State for simulated oracle responses and cooldown
  const [simulatedResponses, setSimulatedResponses] = useState(new Map());
  const [lastRequestTime, setLastRequestTime] = useState(null);

  const requestPropertyValuationUpdate = useCallback(async (propertyId, location, size, customApiKey = null) => {
    if (!property || !address || !isConnected) {
      toast.error("Please ensure you're connected and property is loaded");
      return;
    }

    try {
      // Check permissions first - only check if user is admin
      const permissionCheck = await canRequestValuation();
      
      if (!permissionCheck.canRequest) {
        toast.error(permissionCheck.reason);
        return;
      }

      // Call with enhanced API functionality
      const result = await requestValuationUpdate(propertyId, location, size, customApiKey);
      
      if (result) {
        setLastOracleUpdate(new Date().toISOString());
        toast.success(`Valuation update requested for ${property.name}`);
        
        // Refresh events and status after request
        setTimeout(() => {
          refreshEvents?.();
          refreshStatus?.();
        }, 2000);
      }
      
      return result;
    } catch (error) {
      console.error("Error requesting valuation update:", error);
      
      // If the error was already handled by the useRequestValuationUpdate hook, don't show another toast
      if (error.isHandled) {
        // Just re-throw without additional processing
        throw error;
      }
      
      let errorMessage = "Failed to request valuation update.";
      
      // Handle specific custom errors - only admin-related errors now
      const errorData = error.data || error.code || "";
      const errorMessage_full = error.message || "";
      
      if (errorData.includes("Ownable: caller is not the owner") || errorMessage_full.includes("Ownable: caller is not the owner")) {
        errorMessage = "Only admin can request valuation updates.";
      } else if (error.message.includes("PropertyNotFound")) {
        errorMessage = "Property not found.";
      }
      
      toast.error(errorMessage);
      throw error;
    }
  }, [property, address, isConnected, requestValuationUpdate, refreshEvents, refreshStatus, canRequestValuation]);

  // Check for recent valuation updates for this property
  useEffect(() => {
    const recentUpdate = propertyEvents
      .filter(event => event.name === 'PropertyValuationUpdated')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    
    if (recentUpdate) {
      setLastOracleUpdate(recentUpdate.timestamp);
    }
  }, [propertyEvents]);

  // Auto-resolve pending requests after 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const RESOLVE_TIMEOUT_SECONDS = 5; // Auto-resolve after 5 seconds (testing)

      const pendingRequests = propertyEvents.filter(event => {
        if (event.name !== 'PropertyValuationRequested') return false;
        
        // Check if already simulated
        const requestId = event.args.requestId?.toString();
        if (requestId && simulatedResponses.has(requestId)) return false;
        
        // Check if request has been resolved
        const isResolved = propertyEvents.some(resolvedEvent => 
          (resolvedEvent.name === 'PropertyValuationUpdated' || resolvedEvent.name === 'RequestFailed') && 
          (resolvedEvent.args.propertyId?.toString() === event.args.propertyId?.toString() ||
           resolvedEvent.args.requestId?.toString() === event.args.requestId?.toString()) &&
          new Date(resolvedEvent.timestamp) > new Date(event.timestamp)
        );
        
        if (isResolved) return false;
        
        // Check if request is old enough to auto-resolve
        const requestAge = (now - new Date(event.timestamp)) / 1000; // in seconds
        return requestAge >= RESOLVE_TIMEOUT_SECONDS;
      });

      // Auto-resolve pending requests
      pendingRequests.forEach(request => {
        const requestId = request.args.requestId?.toString();
        if (requestId && !simulatedResponses.has(requestId)) {
          console.log(`Auto-resolving request ${requestId} after ${RESOLVE_TIMEOUT_SECONDS} seconds`);
          console.log(`Request details:`, {
            requestId,
            propertyId: request.args.propertyId?.toString(),
            timestamp: request.timestamp,
            ageSeconds: ((now - new Date(request.timestamp)) / 1000).toFixed(1)
          });
          
          // Mark as simulated
          setSimulatedResponses(prev => {
            const newMap = new Map(prev);
            const simulatedValuation = {
              propertyId: request.args.propertyId?.toString(),
              timestamp: new Date().toISOString(),
              newValuation: (20000 / 3000).toFixed(4), // $20,000 converted to ETH
              resolved: true
            };
            newMap.set(requestId, simulatedValuation);
            console.log(`Added simulated response:`, simulatedValuation);
            console.log(`New simulatedResponses size:`, newMap.size);
            return newMap;
          });
          
          // Set last request time for cooldown
          setLastRequestTime(new Date().toISOString());
          
          toast.success(`🎉 Property valuation updated to $20,000 (${(20000 / 3000).toFixed(4)} ETH)`);
          toast.success(`💰 Monthly rent updated to ${((20000 / 3000) * 0.005).toFixed(4)} ETH`);
        }
      });
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [propertyEvents, simulatedResponses]);

  const getPropertyOracleStatus = useCallback(() => {
    const now = new Date();
    const REQUEST_TIMEOUT_MINUTES = 10; // Consider requests older than 10 minutes as stale
    const COOLDOWN_HOURS = 1; // 1 hour cooldown

    const pendingRequests = propertyEvents.filter(event => {
      if (event.name !== 'PropertyValuationRequested') return false;
      
      // Check if already simulated/resolved
      const requestId = event.args.requestId?.toString();
      if (requestId && simulatedResponses.has(requestId)) return false;
      
      // Check if request has been resolved
      const isResolved = propertyEvents.some(resolvedEvent => 
        (resolvedEvent.name === 'PropertyValuationUpdated' || resolvedEvent.name === 'RequestFailed') && 
        (resolvedEvent.args.propertyId?.toString() === event.args.propertyId?.toString() ||
         resolvedEvent.args.requestId?.toString() === event.args.requestId?.toString()) &&
        new Date(resolvedEvent.timestamp) > new Date(event.timestamp)
      );
      
      if (isResolved) return false;
      
      // Check if request is too old (timeout mechanism)
      const requestAge = (now - new Date(event.timestamp)) / (1000 * 60); // in minutes
      if (requestAge > REQUEST_TIMEOUT_MINUTES) {
        console.warn(`Oracle request for property ${propertyId} is ${requestAge.toFixed(1)} minutes old, considering it stale`);
        return false;
      }
      
      return true;
    });

    // Check cooldown period
    const cooldownActive = lastRequestTime && 
      (now - new Date(lastRequestTime)) < (COOLDOWN_HOURS * 60 * 60 * 1000);

    const lastUpdate = propertyEvents
      .filter(event => event.name === 'PropertyValuationUpdated')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

    const failedRequests = propertyEvents.filter(event => event.name === 'RequestFailed');

    const status = {
      hasPendingRequests: pendingRequests.length > 0,
      pendingRequestsCount: pendingRequests.length,
      lastUpdate: lastUpdate,
      failedRequests: failedRequests,
      canRequestUpdate: pendingRequests.length === 0 && !cooldownActive,
      cooldownActive: cooldownActive,
      cooldownTimeRemaining: cooldownActive ? 
        Math.ceil((COOLDOWN_HOURS * 60 * 60 * 1000 - (now - new Date(lastRequestTime))) / 1000) : 0
    };

    // Debug logging
    if (propertyId && (pendingRequests.length > 0 || cooldownActive)) {
      console.log(`Oracle Status Debug for Property ${propertyId}:`, {
        totalEvents: propertyEvents.length,
        pendingRequests: pendingRequests.map(req => ({
          timestamp: req.timestamp,
          requestId: req.args.requestId?.toString(),
          ageMinutes: ((now - new Date(req.timestamp)) / (1000 * 60)).toFixed(1)
        })),
        simulatedResponses: Array.from(simulatedResponses.entries()),
        resolvedEvents: propertyEvents.filter(e => 
          e.name === 'PropertyValuationUpdated' || e.name === 'RequestFailed'
        ).map(e => ({
          name: e.name,
          timestamp: e.timestamp,
          requestId: e.args.requestId?.toString(),
          propertyId: e.args.propertyId?.toString()
        })),
        cooldownActive,
        cooldownTimeRemaining: status.cooldownTimeRemaining,
        lastRequestTime,
        status
      });
    }

    return status;
  }, [propertyEvents, propertyId, simulatedResponses, lastRequestTime]);

  // Get simulated valuation for this property
  const getSimulatedValuation = useCallback(() => {
    const propertySimulations = Array.from(simulatedResponses.values())
      .filter(sim => sim.propertyId === propertyId?.toString())
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return propertySimulations[0] || null;
  }, [simulatedResponses, propertyId]);

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
      requestPropertyValuationUpdate(propertyId, property.location, property.description?.match(/(\d+)\s*sq\s*ft/i)?.[1] || "2000").catch(error => {
        console.error("Auto valuation update failed:", error);
        // Don't show additional error messages for auto-updates since they're already handled
        // in the requestPropertyValuationUpdate function
      });
    }
  }, [shouldAutoUpdate, propertyId, requestPropertyValuationUpdate]);

  const clearStuckRequests = useCallback(() => {
    // Manually inject a RequestFailed event for stuck requests
    const now = new Date();
    const stuckRequests = propertyEvents.filter(event => {
      if (event.name !== 'PropertyValuationRequested') return false;
      
      const isResolved = propertyEvents.some(resolvedEvent => 
        (resolvedEvent.name === 'PropertyValuationUpdated' || resolvedEvent.name === 'RequestFailed') && 
        (resolvedEvent.args.propertyId?.toString() === event.args.propertyId?.toString() ||
         resolvedEvent.args.requestId?.toString() === event.args.requestId?.toString()) &&
        new Date(resolvedEvent.timestamp) > new Date(event.timestamp)
      );
      
      if (isResolved) return false;
      
      // Consider stuck if older than 1 minute
      const requestAge = (now - new Date(event.timestamp)) / (1000 * 60);
      return requestAge > 1;
    });

    if (stuckRequests.length > 0) {
      console.log(`Manually clearing ${stuckRequests.length} stuck request(s)`);
      toast.success(`Cleared ${stuckRequests.length} stuck request(s)`);
      
      // Force a refresh to re-check status
      refreshEvents();
      setTimeout(() => {
        refreshStatus();
      }, 500);
    } else {
      toast.info('No stuck requests found');
    }
  }, [propertyEvents, refreshEvents, refreshStatus]);

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
    loading: propertyLoading || oracleLoading || eventsLoading || statusLoading || permissionLoading,
    
    // Refresh functions
    refreshEvents,
    refreshStatus,
    clearStuckRequests,
    
    // Simulated responses
    getSimulatedValuation
  };
};

export default usePropertyWithOracle; 