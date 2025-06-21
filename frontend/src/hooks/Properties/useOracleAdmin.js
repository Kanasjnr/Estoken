"use client";

import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useAppKitAccount } from "@reown/appkit/react";
import useContract from "../useContract";
import OracleABI from "../../abis/RealEstateOracle.json";

const useOracleAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { address, isConnected } = useAppKitAccount();
  const contractAddress = import.meta.env.VITE_APP_REAL_ESTATE_ORACLE_ADDRESS;
  const { contract } = useContract(contractAddress, OracleABI);

  const updateSubscriptionId = useCallback(
    async (newSubscriptionId) => {
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
        const tx = await contract.updateSubscriptionId(newSubscriptionId);
        const receipt = await tx.wait();

        if (receipt.status === 1) {
          toast.success("Subscription ID updated successfully!");
          return receipt.transactionHash;
        } else {
          throw new Error("Transaction failed");
        }
      } catch (err) {
        console.error("Error updating subscription ID:", err);
        toast.error(`Error: ${err.message || "An unknown error occurred."}`);
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [address, isConnected, contract]
  );

  const updateGasLimit = useCallback(
    async (newGasLimit) => {
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
        const tx = await contract.updateGasLimit(newGasLimit);
        const receipt = await tx.wait();

        if (receipt.status === 1) {
          toast.success("Gas limit updated successfully!");
          return receipt.transactionHash;
        } else {
          throw new Error("Transaction failed");
        }
      } catch (err) {
        console.error("Error updating gas limit:", err);
        toast.error(`Error: ${err.message || "An unknown error occurred."}`);
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [address, isConnected, contract]
  );

  const getOracleConfig = useCallback(async () => {
    if (!contract) {
      return null;
    }

    try {
      const [subscriptionId, gasLimit, donId, realEstateToken] = await Promise.all([
        contract.s_subscriptionId(),
        contract.gasLimit(),
        contract.donId(),
        contract.realEstateToken()
      ]);

      return {
        subscriptionId: subscriptionId.toString(),
        gasLimit: gasLimit.toString(),
        donId: donId,
        realEstateToken: realEstateToken
      };
    } catch (err) {
      console.error("Error getting oracle config:", err);
      setError(err.message);
      return null;
    }
  }, [contract]);

  return { 
    updateSubscriptionId, 
    updateGasLimit, 
    getOracleConfig,
    loading, 
    error 
  };
};

export default useOracleAdmin; 