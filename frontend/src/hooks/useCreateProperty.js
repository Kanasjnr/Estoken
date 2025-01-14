import { useCallback } from "react";
import { toast } from "react-toastify";
import { baseSepolia } from "@reown/appkit/networks";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import useSignerOrProvider from "./useSignerOrProvider";
import ABI from "../abis/PropertyRegistry.json";
import { ethers } from "ethers";


const useCreateProperty = () => {
  const { address, isConnected } = useAppKitAccount(); // Account address and connection status
  const { chainId } = useAppKitNetwork(); // Network chain ID
  const { signer } = useSignerOrProvider(); // Signer or provider for making transactions

  return useCallback(
    async (name, location, tokenId) => {
      // Step 1: Validate User's Wallet Connection and Network
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

      // Step 2: Retrieve Property Registry Address from Environment Variables
      const propertyRegistryAddress = import.meta.env.VITE_APP_PROPERTY_REGISTRY_ADDRESS;

      try {
        console.log("Creating contract instance...");

        // Step 3: Create Contract Instance with ABI and Signer
        const contract = new ethers.Contract(propertyRegistryAddress, ABI, signer);
        console.log("Contract Address:", propertyRegistryAddress);
        console.log("Signer Address:", await signer.getAddress());

        // Step 4: Check if addProperty function is available in the contract
        if (typeof contract.addProperty !== "function") {
          throw new Error("addProperty function is not available in the contract.");
        }

        // Step 5: Prepare Transaction for Adding Property
        console.log("Preparing to call addProperty...");
        console.log("Parameters:", { name, location, tokenId });

        // Step 6: Fetch the Default Listing Fee
        const defaultListingFee = await contract.defaultListingFee();
        console.log("Default Listing Fee:", defaultListingFee.toString());

        // Step 7: Send Transaction to the Blockchain
        const tx = await contract.addProperty(name, location, tokenId, [], defaultListingFee, {
          value: defaultListingFee, // Attach the listing fee to the transaction
        });

        // Step 8: Wait for the Transaction to be Mined
        console.log("Transaction Sent:", tx.hash);
        const receipt = await tx.wait();

        // Step 9: Check Transaction Status
        if (receipt.status === 1) {
          toast.success("Property created successfully!");
        } else {
          toast.error("Failed to create property.");
        }
      } catch (error) {
        // Step 10: Handle Errors During Property Creation
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
    [address, isConnected, chainId, signer] // Dependencies for re-triggering the callback
  );
};

export default useCreateProperty;
