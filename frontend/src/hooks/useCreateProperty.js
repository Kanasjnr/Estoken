import { useCallback } from "react";
import { toast } from "react-toastify";
import { useAppKitAccount } from "@reown/appkit/react";
import useSignerOrProvider from "./useSignerOrProvider";
import ABI from "../abis/PropertyRegistry.json";
import { ethers } from "ethers";

const useCreateProperty = () => {
  const { address, isConnected } = useAppKitAccount();
  const { signer } = useSignerOrProvider();

  return useCallback(
    async (name, location, tokenId, imageUrls, listingFee) => {
      if (!address || !isConnected) {
        toast.error("Please connect your wallet");
        return;
      }

      if (!signer) {
        toast.error("Signer is not available");
        return;
      }

      const propertyRegistryAddress = import.meta.env
        .VITE_APP_PROPERTY_REGISTRY_ADDRESS;

      try {
        console.log("Creating contract instance...");

        const contract = new ethers.Contract(
          propertyRegistryAddress,
          ABI,
          signer
        );
        console.log("Contract Address:", propertyRegistryAddress);
        console.log("Signer Address:", await signer.getAddress());

        if (typeof contract.addProperty !== "function") {
          throw new Error(
            "addProperty function is not available in the contract."
          );
        }

        console.log("Preparing to call addProperty...");
        console.log("Parameters:", {
          name,
          location,
          tokenId,
          imageUrls,
          listingFee,
        });

        const tx = await contract.addProperty(
          name,
          location,
          tokenId,
          imageUrls,
          {
            value: ethers.parseUnits(listingFee.toString()),
          }
        );

        console.log("Transaction Sent:", tx.hash);
        const receipt = await tx.wait();

        if (receipt.status === 1) {
          toast.success("Property created successfully!");
        } else {
          toast.error("Failed to create property.");
        }
      } catch (error) {
        console.error("Error creating property:", error);
        if (error.reason) {
          toast.error(`Error: ${error.reason}`);
        } else if (error.message) {
          toast.error(`Error: ${error.message}`);
        } else {
          toast.error("An unknown error occurred while creating the property.");
        }
      }
    },
    [address, isConnected, signer]
  );
};

export default useCreateProperty;
