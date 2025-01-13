import { useCallback } from "react";
import useContract from "./useContract";
import { useAppKitAccount } from "@reown/appkit/react";
import { toast } from "react-toastify";
import { ErrorDecoder } from "ethers-decode-error";

const useCreateProperty = () => {
  const contract = useContract("PropertyRegistry");
  const { address } = useAppKitAccount();

  const addProperty = useCallback(
    async (name, location, tokenId) => {
      if (!name || !location || !tokenId) {
        toast.error("Name, location, and tokenId are required");
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
        const listingFee = await contract.listingFee();
        const estimatedGas = await contract.addProperty.estimateGas(
          name,
          location,
          tokenId,
          { value: listingFee }
        );

        const tx = await contract.addProperty(name, location, tokenId, {
          value: listingFee,
          gasLimit: (estimatedGas * BigInt(120)) / BigInt(100),
        });

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          toast.success("Property added successfully");
          return receipt;
        }

        toast.error("Failed to add property");
      } catch (error) {
        const errorDecoder = ErrorDecoder.create();
        const decodedError = errorDecoder.decode(error);

        console.error("Error adding property", decodedError);
        toast.error((await decodedError).reason);
      }
    },
    [contract, address]
  );

  const getProperty = useCallback(
    async (propertyId) => {
      if (!contract) {
        toast.error("Contract not found");
        return;
      }

      try {
        const property = await contract.getProperty(propertyId);
        return {
          name: property[0],
          location: property[1],
          tokenId: property[2],
          isActive: property[3],
        };
      } catch (error) {
        console.error("Error fetching property", error);
        toast.error("Failed to fetch property");
      }
    },
    [contract]
  );

  return { addProperty, getProperty };
};

export default useCreateProperty;