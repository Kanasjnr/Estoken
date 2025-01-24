import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { ethers } from "ethers";
import { useAppKitAccount } from "@reown/appkit/react";
import useSignerOrProvider from "./useSignerOrProvider";
import ABI from "../abis/RealEstateToken.json";

const useClaimRentalIncome = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { address, isConnected } = useAppKitAccount();
  const { signer } = useSignerOrProvider();

  const claimRentalIncome = useCallback(
    async (propertyId) => {
      if (!address || !isConnected) {
        toast.error("Please connect your wallet");
        return false;
      }

      if (!signer) {
        toast.error("Signer is not available");
        return false;
      }

      if (!propertyId || isNaN(propertyId) || Number(propertyId) <= 0) {
        toast.error("Invalid property ID. Please enter a valid property ID.");
        return false;
      }

      setLoading(true);
      setError(null);

      const propertyRegistryAddress = import.meta.env.VITE_APP_ESTOKEN_ADDRESS;

      if (!propertyRegistryAddress) {
        toast.error("Contract address is not configured");
        setLoading(false);
        return false;
      }

      try {
        const contract = new ethers.Contract(propertyRegistryAddress, ABI, signer);

        console.log("Property ID:", propertyId);

        // Call the `claimRentalIncome` function
        const tx = await contract.claimRentalIncome(propertyId);
        const receipt = await tx.wait();

        if (receipt.status === 1) {
          toast.success(`Rental income for property ID ${propertyId} claimed successfully!`);
          return true;
        } else {
          throw new Error("Transaction failed");
        }
      } catch (err) {
        console.error("Transaction error:", err);

        // Enhanced error handling to capture the revert reason
        let errorMessage = "An unknown error occurred.";
        
        if (err?.data?.message) {
          console.error("Revert Reason:", err.data.message);
          errorMessage = `Error claiming rental income: ${err.data.message}`;
        } else if (err?.reason) {
          console.error("Revert Reason:", err.reason);
          errorMessage = `Error claiming rental income: ${err.reason}`;
        } else if (err?.message) {
          console.error("Error message:", err.message);
          errorMessage = `Error claiming rental income: ${err.message}`;
        }

        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [address, isConnected, signer]
  );

  return { claimRentalIncome, loading, error };
};

export default useClaimRentalIncome;
