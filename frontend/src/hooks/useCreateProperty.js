import { useCallback } from "react";
import { toast } from "react-toastify";
import { baseSepolia } from "@reown/appkit/networks";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { ethers } from "ethers";
import useSignerOrProvider from "./useSignerOrProvider";

import ABI from "../abis/PropertyRegistry.json";

const useCreateProperty = () => {
  const { address, isConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const { signer } = useSignerOrProvider();

  return useCallback(
    async (contractAddress, name, location, tokenId) => {
      if (!name || !location || !tokenId) {
        toast.error("Name, location, and tokenId are required");
        return;
      }

      if (!address || !isConnected) {
        toast.error("Please connect your wallet");
        return;
      }

      if (Number(chainId) !== Number(baseSepolia.id)) {
        toast.error("Please switch network to Sepolia");
        return;
      }

      if (!signer) {
        toast.error("Signer is not available");
        return;
      }

      try {
        const contract = new ethers.Contract(
          contractAddress,
          ABI,
          signer
        );

        const estimatedGas = await contract.estimateGas.addProperty(
          name,
          location,
          tokenId
        );

        const tx = await contract.addProperty(name, location, tokenId, {
          gasLimit: estimatedGas.mul(120).div(100), // 20% buffer
        });

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          toast.success("Property created successfully!");
        } else {
          toast.error("Failed to create property.");
        }
      } catch (error) {
        console.error("Error creating property:", error);
        const errorMessage =
          error?.reason || "An error occurred while creating the property.";
        toast.error(errorMessage);
      }
    },
    [address, isConnected, chainId, signer]
  );
};

export default useCreateProperty;
