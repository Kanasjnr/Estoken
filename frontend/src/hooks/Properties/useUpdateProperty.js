"use client";

import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { ethers } from "ethers";
import { useAppKitAccount } from "@reown/appkit/react";
import useContract from "../useContract";
import ABI from "../../abis/RealEstateToken.json";

const useUpdateProperty = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { address, isConnected } = useAppKitAccount();
  const contractAddress = import.meta.env.VITE_APP_REAL_ESTATE_TOKEN_ADDRESS;
  const { contract } = useContract(contractAddress, ABI);

  const updateProperty = useCallback(
    async (propertyId, name, location, description, pricePerShare, isActive) => {
      if (!address || !isConnected) {
        toast.error("Please connect your wallet");
        return;
      }

      if (!contract) {
        toast.error("Contract is not available");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const pricePerShareInWei = ethers.parseEther(pricePerShare.toString());
        
        const tx = await contract.updateProperty(
          propertyId,
          name,
          location,
          description,
          pricePerShareInWei,
          isActive
        );
        
        const receipt = await tx.wait();

        if (receipt.status === 1) {
          toast.success("Property updated successfully!");
          return receipt.transactionHash;
        } else {
          throw new Error("Transaction failed");
        }
      } catch (err) {
        console.error("Error updating property:", err);
        toast.error(`Error: ${err.message || "An unknown error occurred."}`);
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [address, isConnected, contract]
  );

  return { updateProperty, loading, error };
};

export default useUpdateProperty; 