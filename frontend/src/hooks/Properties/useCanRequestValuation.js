"use client";

import { useState, useCallback } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import useContract from "../useContract";
import OracleABI from "../../abis/RealEstateOracle.json";

const useCanRequestValuation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { address, isConnected } = useAppKitAccount();
  
  const oracleAddress = import.meta.env.VITE_APP_REAL_ESTATE_ORACLE_ADDRESS;
  
  const { contract: oracleContract } = useContract(oracleAddress, OracleABI);

  const canRequestValuation = useCallback(
    async () => {
      if (!address || !isConnected) {
        return {
          canRequest: false,
          reason: "Please connect your wallet",
          isOwner: false
        };
      }

      if (!oracleContract) {
        return {
          canRequest: false,
          reason: "Contracts are not available",
          isOwner: false
        };
      }

      setLoading(true);
      setError(null);

      try {
        // Check if user is the contract owner (admin)
        const contractOwner = await oracleContract.owner();
        const isOwner = contractOwner.toLowerCase() === address.toLowerCase();
        
        return {
          canRequest: isOwner,
          reason: isOwner ? "" : "Only admin can request valuation updates",
          isOwner
        };
      } catch (err) {
        console.error("Error checking valuation request permissions:", err);
        const errorMessage = err.reason || err.message || "Failed to check permissions";
        setError(errorMessage);
        
        return {
          canRequest: false,
          reason: errorMessage,
          isOwner: false
        };
      } finally {
        setLoading(false);
      }
    },
    [address, isConnected, oracleContract]
  );

  return { canRequestValuation, loading, error };
};

export default useCanRequestValuation; 