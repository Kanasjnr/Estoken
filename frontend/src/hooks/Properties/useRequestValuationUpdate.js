"use client";

import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useAppKitAccount } from "@reown/appkit/react";
import useContract from "../useContract";
import OracleABI from "../../abis/RealEstateOracle.json";

const useRequestValuationUpdate = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { address, isConnected } = useAppKitAccount();
  const contractAddress = import.meta.env.VITE_APP_REAL_ESTATE_ORACLE_ADDRESS;
  const { contract } = useContract(contractAddress, OracleABI);

  const requestValuationUpdate = useCallback(
    async (propertyId, location, size, customApiKey = null) => {
      if (!address || !isConnected) {
        toast.error("Please connect your wallet");
        return;
      }

      if (!contract) {
        toast.error("Oracle contract is not available");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Use the appropriate function based on whether a custom API key is provided
        let tx;
        if (customApiKey && customApiKey.trim()) {
          // Use custom API key function
          tx = await contract.requestValuationUpdateWithKey(propertyId, location, size, customApiKey);
        } else {
          // Use default API key function
          tx = await contract.requestValuationUpdate(propertyId, location, size);
        }
        
        const receipt = await tx.wait();

        if (receipt.status === 1) {
          toast.success("Valuation update request sent successfully!");
          
          // Find the PropertyValuationRequested event
          const event = receipt.logs.find(
            log => log.topics[0] === contract.interface.getEvent("PropertyValuationRequested").topicHash
          );
          
          if (event) {
            const parsedEvent = contract.interface.parseLog(event);
            return {
              transactionHash: receipt.transactionHash,
              requestId: parsedEvent.args.requestId,
              propertyId: parsedEvent.args.propertyId
            };
          }
          
          return { transactionHash: receipt.transactionHash };
        } else {
          throw new Error("Transaction failed");
        }
      } catch (err) {
        console.error("Error requesting valuation update:", err);
        
        let errorMessage = "An unknown error occurred.";
        
        // Handle specific custom errors - only admin-related errors now
        const errorData = err.data || err.code || "";
        const errorMessage_full = err.message || "";
        
        if (errorData.includes("Ownable: caller is not the owner") || errorMessage_full.includes("Ownable: caller is not the owner")) {
          errorMessage = "Only admin can request valuation updates.";
        } else if (err.message.includes("PropertyNotFound")) {
          errorMessage = "Property not found.";
        } else if (err.reason) {
          errorMessage = err.reason;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        toast.error(`Error: ${errorMessage}`);
        setError(errorMessage);
        
        // Create a custom error with the user-friendly message
        const customError = new Error(errorMessage);
        customError.isHandled = true;
        customError.originalError = err;
        throw customError;
      } finally {
        setLoading(false);
      }
    },
    [address, isConnected, contract]
  );

  return { requestValuationUpdate, loading, error };
};

export default useRequestValuationUpdate; 