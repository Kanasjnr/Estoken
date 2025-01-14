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
        // Validate imageUrls
        if (!Array.isArray(imageUrls) || imageUrls.some(url => typeof url !== "string")) {
          throw new Error("Invalid imageUrls: Must be an array of strings.");
        }

        console.log("Image URLs:", imageUrls);

        // Validate and convert listingFee to Wei
        const fee = parseFloat(listingFee);
        if (isNaN(fee) || fee <= 0) {
          throw new Error("Invalid listing fee.");
        }
        const listingFeeInWei = ethers.parseUnits(fee.toString());

        console.log("Creating contract instance...");
        const contract = new ethers.Contract(propertyRegistryAddress, ABI, signer);
        console.log("Contract Address:", propertyRegistryAddress);

        const tx = await contract.addProperty(
          name,
          location,
          tokenId,
          imageUrls,
          listingFeeInWei,
          { value: listingFeeInWei }
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
        toast.error(`Error: ${error.message || "An unknown error occurred."}`);
      }
    },
    [address, isConnected, signer]
  );
};

export default useCreateProperty;
