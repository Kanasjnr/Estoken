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


      // Estimate gas for the claim transaction
      const gasEstimate = await contract.claimRentalIncome.estimateGas(propertyId);
      console.log("Gas estimate:", gasEstimate.toString());

      // Perform the claim
      const tx = await contract.claimRentalIncome(propertyId);
      const receipt = await tx.wait();

      // Check if the transaction was successful
      if (receipt.status === 1) {
        toast.success("Rental income claimed successfully!");
        return true;
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error) {
      console.error("Error claiming rental income:", error);

      if (error.code === "CALL_EXCEPTION") {
        toast.error("Failed to claim rental income. Please check your contract and try again.");
      } else if (error.code === "INSUFFICIENT_FUNDS") {
        toast.error("Insufficient funds for the transaction.");
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
