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
        toast.error(`Error: ${err.message || "An unknown error occurred."}`);
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [address, isConnected, contract]
  );

  return { requestValuationUpdate, loading, error };
};

export default useRequestValuationUpdate; 