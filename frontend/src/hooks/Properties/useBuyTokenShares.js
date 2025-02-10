import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { ethers } from "ethers";
import { useAppKitAccount } from "@reown/appkit/react";
import useSignerOrProvider from "../useSignerOrProvider";
import ABI from "../../abis/RealEstateToken.json";

const useBuyTokensShares = () => {
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

      if (!amount || isNaN(amount) || Number(amount) <= 0 || !Number.isInteger(Number(amount))) {
        toast.error("Invalid purchase amount. Please enter a positive integer.");
        return false;
      }

      if (!pricePerShare || isNaN(pricePerShare) || Number(pricePerShare) <= 0) {
        toast.error("Invalid price per share. Please enter a positive number.");
        return false;
      }

      setLoading(true);
      setError(null);

      const propertyRegistryAddress = import.meta.env.VITE_APP_REAL_ESTATE_TOKEN_ADDRESS;

      if (!propertyRegistryAddress) {
        toast.error("Contract address is not configured");
        setLoading(false);
        return false;
      }

      try {
        const contract = new ethers.Contract(propertyRegistryAddress, ABI, signer);

        // Convert inputs to BigInt
        const amountBigInt = BigInt(amount);
        const pricePerShareBigInt = ethers.parseEther(pricePerShare.toString());
        const totalPriceWei = pricePerShareBigInt * amountBigInt;

        console.log("Amount:", amountBigInt.toString());
        console.log("Price per share (Wei):", pricePerShareBigInt.toString());
        console.log("Total Price (Wei):", totalPriceWei.toString());

        // Estimate gas
        const estimatedGas = await contract.buyTokenShares.estimateGas(propertyId, amountBigInt, {
          value: totalPriceWei,
        });

        // Add 20% buffer to estimated gas
        const gasLimit = (estimatedGas * BigInt(120)) / BigInt(100);

        // Proceed with the transaction
        const tx = await contract.buyTokenShares(propertyId, amountBigInt, {
          value: totalPriceWei,
          gasLimit: gasLimit,
        });

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          toast.success("Tokens purchased successfully! NFT minted.");
          return true;
        } else {
          throw new Error("Transaction failed");
        }
      } catch (err) {
        console.error("Transaction error:", err);

        // Capture revert reason if available
        if (err.data?.message) {
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
    [address, isConnected, signer],
  );

  return { buyTokens, loading, error };
};

export default useBuyTokensShares;