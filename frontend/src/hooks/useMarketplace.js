import { useCallback } from "react";
import useContractInstance from "./useContract";
import { useAppKitAccount } from "@reown/appkit/react";
import { toast } from "react-toastify";
import { ErrorDecoder } from "ethers-decode-error";

const useMarketplace = () => {
  const contract = useContractInstance("Marketplace");
  const { address } = useAppKitAccount();

  const createListing = useCallback(
    async (tokenId, amount, pricePerToken) => {
      if (!tokenId || !amount || !pricePerToken) {
        toast.error("All fields are required");
        return;
      }

      if (!address) {
        toast.error("Please connect your wallet");
        return;
      }

      if (!contract) {
        toast.error("Contract not found");
        return;
      }

     

      try {
        const estimatedGas = await contract.createListing.estimateGas(tokenId, amount, pricePerToken);

        const tx = await contract.createListing(tokenId, amount, pricePerToken, {
          gasLimit: (estimatedGas * BigInt(120)) / BigInt(100),
        });

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          toast.success("Listing created successfully");
          return;
        }

        toast.error("Failed to create listing");
      } catch (error) {
        const errorDecoder = ErrorDecoder.create();
        const decodedError = errorDecoder.decode(error);

        console.error("Error creating listing", decodedError);
        toast.error((await decodedError).reason);
      }
    },
    [contract, address]
  );

  const buyTokens = useCallback(
    async (listingId, amount, value) => {
      if (!listingId || !amount || !value) {
        toast.error("All fields are required");
        return;
      }

      if (!address) {
        toast.error("Please connect your wallet");
        return;
      }

      if (!contract) {
        toast.error("Contract not found");
        return;
      }

     

      try {
        const estimatedGas = await contract.buyTokens.estimateGas(listingId, amount, { value });

        const tx = await contract.buyTokens(listingId, amount, {
          value,
          gasLimit: (estimatedGas * BigInt(120)) / BigInt(100),
        });

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          toast.success("Tokens purchased successfully");
          return;
        }

        toast.error("Failed to purchase tokens");
      } catch (error) {
        const errorDecoder = ErrorDecoder.create();
        const decodedError = errorDecoder.decode(error);

        console.error("Error buying tokens", decodedError);
        toast.error((await decodedError).reason);
      }
    },
    [contract, address]
  );

  return { createListing, buyTokens };
};

export default useMarketplace;

