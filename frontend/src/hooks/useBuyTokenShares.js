import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useAppKitAccount } from "@reown/appkit/react";
import useContract from "./useContract";
import ABI from "../abis/RealEstateToken.json";

const useBuyTokenShares = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { address, isConnected } = useAppKitAccount();
  const contractAddress = import.meta.env.VITE_APP_REAL_ESTATE_TOKEN_ADDRESS;
  const { contract } = useContract(contractAddress, ABI);

  const buyTokenShares = useCallback(
    async (propertyId, amount) => {
      if (!address || !isConnected) {
        toast.error("Please connect your wallet");
        return false;
      }

      if (!contract) {
        toast.error("Contract is not available");
        return false;
      }

      if (!propertyId || typeof propertyId !== "string" || propertyId.trim() === "") {
        toast.error("Invalid property ID");
        return false;
      }

      if (!amount || isNaN(amount) || Number(amount) <= 0 || !Number.isInteger(Number(amount))) {
        toast.error("Invalid purchase amount. Please enter a positive integer.");
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        // Calculate total price required for the transaction
        const [totalPrice] = await contract.calculatePurchase(propertyId, amount);
        if (!totalPrice || totalPrice <= 0) {
          toast.error("Invalid total price calculation.");
          setLoading(false);
          return false;
        }

        // Proceed with the purchase transaction
        const tx = await contract.buyTokenShares(propertyId, amount, { value: totalPrice });
        const receipt = await tx.wait();

        if (receipt.status === 1) {
          toast.success("Token shares purchased successfully!");
          return receipt.transactionHash;
        } else {
          throw new Error("Transaction failed");
        }
      } catch (err) {
        console.error("Transaction error:", err);
        setError(err.message || "An unknown error occurred");
        toast.error(`Error: ${err.message || "An unknown error occurred."}`);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [address, isConnected, contract]
  );

  return { buyTokenShares, loading, error };
};

export default useBuyTokenShares;
