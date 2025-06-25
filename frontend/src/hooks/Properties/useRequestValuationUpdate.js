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
    async (propertyId, location, size) => {
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
        const tx = await contract.requestValuationUpdate(propertyId, location, size);
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
        
        // Handle specific custom errors
        const errorData = err.data || err.code || "";
        const errorMessage_full = err.message || "";
        
        if (errorData.includes("0x71e83137") || errorMessage_full.includes("0x71e83137")) {
          errorMessage = "You don't have permission to request valuation updates for this property. Only property token holders can request updates.";
        } else if (errorData.includes("0x8254fc8a") || errorMessage_full.includes("0x8254fc8a")) {
          errorMessage = "⏰ Cooldown Active: Please wait before requesting another valuation update. There's a 1-hour cooldown period between requests.";
        } else if (err.message.includes("NotPropertyHolder")) {
          errorMessage = "You must own tokens of this property to request valuation updates.";
        } else if (err.message.includes("RequestTooSoon")) {
          errorMessage = "Please wait before requesting another valuation update (1 hour cooldown).";
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