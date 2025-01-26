import { useState } from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { useAppKitAccount } from "@reown/appkit/react";
import ABI from "../abis/RealEstateToken.json";
import useSignerOrProvider from "./useSignerOrProvider";

const useClaimRentalIncome = () => {
  const [loading, setLoading] = useState(false);
  const { address, isConnected } = useAppKitAccount();
  const { signer } = useSignerOrProvider();

  const claimRentalIncome = async (propertyId) => {
    if (!address || !isConnected) {
      toast.error("Please connect your wallet.");
      return false;
    }

    if (!signer) {
      toast.error("Signer is not available.");
      return false;
    }

    setLoading(true);

    try {
      const contractAddress = import.meta.env.VITE_APP_ESTOKEN_ADDRESS;
      const contract = new ethers.Contract(contractAddress, ABI, signer);

   

      // Perform the claim without gas estimation
      const tx = await contract.claimRentalIncome(propertyId, {
        gasLimit: 300000, // Set a reasonable gas limit
      });
      
      toast.info("Transaction submitted. Waiting for confirmation...");
      
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        toast.success("Rental income claimed successfully!");
        return true;
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error) {
      console.error("Error claiming rental income:", error);

      if (error.code === "ACTION_REJECTED") {
        toast.error("Transaction rejected by user.");
      } else if (error.code === "INSUFFICIENT_FUNDS") {
        toast.error("Insufficient funds for the transaction.");
      } else if (error.message.includes("execution reverted")) {
        toast.error("Transaction reverted. You can claim after 24 hrs.");
      } else {
        toast.error(`Error: ${error.reason || error.message || "An unknown error occurred."}`);
      }

      return false;
    } finally {
      setLoading(false);
    }
  };

  return { claimRentalIncome, loading };
};

export default useClaimRentalIncome;