"use client";

import { useState, useCallback } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import useContract from "../useContract";
import OracleABI from "../../abis/RealEstateOracle.json";

const useCanRequestValuation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { address, isConnected } = useAppKitAccount();
  const contractAddress = import.meta.env.VITE_APP_REAL_ESTATE_ORACLE_ADDRESS;
  const { contract } = useContract(contractAddress, OracleABI);

  const checkCanRequestValuation = useCallback(
    async (propertyId) => {
      if (!address || !isConnected) {
        return {
          canRequest: false,
          reason: "Please connect your wallet"
        };
      }

      if (!contract) {
        return {
          canRequest: false,
          reason: "Oracle contract is not available"
        };
      }

      setLoading(true);
      setError(null);

      try {
        const canRequest = await contract.canUserRequestValuation(address, propertyId);
        
        if (canRequest) {
          return {
            canRequest: true,
            reason: null
          };
        } else {
          // Check what the specific issue is
          try {
            // Try to get the last request time
            const lastRequestTime = await contract.lastRequestTime(propertyId);
            const currentTime = Math.floor(Date.now() / 1000);
            const cooldownPeriod = 3600; // 1 hour in seconds
            const timeUntilNextRequest = lastRequestTime + cooldownPeriod - currentTime;
            
            if (timeUntilNextRequest > 0) {
              const hours = Math.floor(timeUntilNextRequest / 3600);
              const minutes = Math.floor((timeUntilNextRequest % 3600) / 60);
              return {
                canRequest: false,
                reason: `Please wait ${hours > 0 ? hours + 'h ' : ''}${minutes}m before requesting another valuation update`,
                timeUntilNextRequest
              };
            } else {
              return {
                canRequest: false,
                reason: "You must own tokens of this property to request valuation updates"
              };
            }
                     } catch {
             return {
               canRequest: false,
               reason: "You must own tokens of this property to request valuation updates"
             };
           }
        }
      } catch (err) {
        console.error("Error checking valuation request permission:", err);
        const errorMessage = err.message || "Error checking permissions";
        setError(errorMessage);
        return {
          canRequest: false,
          reason: errorMessage
        };
      } finally {
        setLoading(false);
      }
    },
    [address, isConnected, contract]
  );

  return { checkCanRequestValuation, loading, error };
};

export default useCanRequestValuation; 