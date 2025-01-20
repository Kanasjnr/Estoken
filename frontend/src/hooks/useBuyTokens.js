import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { ethers } from "ethers";
import { useAppKitAccount } from "@reown/appkit/react";
import useSignerOrProvider from "./useSignerOrProvider";
import ABI from "../abis/RealEstateToken.json";

const useBuyTokens = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { address, isConnected } = useAppKitAccount();
  const { signer } = useSignerOrProvider();

  const buyTokens = useCallback(
    async (propertyId, amount, pricePerShare) => {
      if (!address || !isConnected) {
        toast.error("Please connect your wallet");
        return false;
      }

      if (!signer) {
        toast.error("Signer is not available");
        return false;
      }

      if (!amount || isNaN(amount) || Number(amount) <= 0) {
        toast.error("Invalid purchase amount");
        return false;
      }

      setLoading(true);
      setError(null);

      const propertyRegistryAddress = import.meta.env.VITE_APP_ESTOKEN_ADDRESS;

      try {
        const contract = new ethers.Contract(propertyRegistryAddress, ABI, signer);

        // Ensure all inputs are valid BigNumber instances
        const amountBN = ethers.BigNumber.from(amount);
        const pricePerShareBN = ethers.utils.parseEther(pricePerShare.toString());
        const totalPriceWei = pricePerShareBN.mul(amountBN);

        console.log("Property ID:", propertyId);
        console.log("Amount:", amountBN.toString());
        console.log("Price per share (ETH):", pricePerShare);
        console.log("Price per share (Wei):", pricePerShareBN.toString());
        console.log("Total Price (Wei):", totalPriceWei.toString());

        // Estimate gas before sending the transaction
        const gasEstimate = await contract.estimateGas.buyTokenShares(propertyId, amountBN, {
          value: totalPriceWei,
        });

        // Add a 20% buffer to the gas estimate
        const gasLimit = gasEstimate.mul(120).div(100);

        // Proceed with the transaction
        const tx = await contract.buyTokenShares(propertyId, amountBN, {
          value: totalPriceWei,
          gasLimit: gasLimit,
        });

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          toast.success("Tokens purchased successfully!");
          return true;
        } else {
          throw new Error("Transaction failed");
        }
      } catch (err) {
        console.error("Transaction error:", err);

        // Capture revert reason if available
        if (err?.data?.message) {
          console.error("Revert Reason:", err.data.message);
          setError("Error buying tokens: " + err.data.message);
          toast.error(`Error: ${err.data.message}`);
        } else {
          setError("Error buying tokens: " + (err.message || "Unknown error"));
          toast.error(`Error: ${err.message || "An unknown error occurred."}`);
        }
        return false;
      } finally {
        setLoading(false);
      }
    },
    [address, isConnected, signer]
  );

  return { buyTokens, loading, error };
};

export default useBuyTokens;
