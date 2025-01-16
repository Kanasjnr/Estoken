import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { ethers } from "ethers";
import { useAppKitAccount } from "@reown/appkit/react";
import useSignerOrProvider from "./useSignerOrProvider";
import ABI from "../abis/RealEstateToken.json";

const useTokenizeProperty = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { address, isConnected } = useAppKitAccount();
  const { signer } = useSignerOrProvider();

  const tokenizeProperty = useCallback(
    async (name, location, description, imageUrls, totalShares, pricePerShare) => {
      if (!address || !isConnected) {
        toast.error("Please connect your wallet");
        return;
      }

      if (!signer) {
        toast.error("Signer is not available");
        return;
      }

      setLoading(true);
      setError(null);

      const propertyRegistryAddress = import.meta.env.VITE_APP_ESTOKEN_ADDRESS;
      try {
        if (!Array.isArray(imageUrls) || imageUrls.some(url => typeof url !== "string")) {
          throw new Error("Invalid imageUrls: Must be an array of strings.");
        }

        const contract = new ethers.Contract(propertyRegistryAddress, ABI, signer);
        const pricePerShareInWei = ethers.parseUnits(pricePerShare.toString(), "ether");

        const tx = await contract.tokenizeProperty(
          name,
          location,
          description,
          imageUrls,
          totalShares,
          pricePerShareInWei
        );

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          toast.success("Property tokenized successfully!");
          return receipt.transactionHash;
        } else {
          throw new Error("Transaction failed");
        }
      } catch (err) {
        console.error("Error tokenizing property:", err);
        toast.error(`Error: ${err.message || "An unknown error occurred."}`);
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [address, isConnected, signer]
  );

  return { tokenizeProperty, loading, error };
};

export default useTokenizeProperty;