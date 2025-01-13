import { useCallback } from "react";
import useContractInstance from "./useContract";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { toast } from "react-toastify";
import { baseSepolia } from "@reown/appkit/networks";
import { ErrorDecoder } from "ethers-decode-error";

const useCreateProperty = () => {
  const contract = useContractInstance(true);
  const { address } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();

  return useCallback(
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

      if (Number(chainId) !== Number(baseSepolia.id)) {
        toast.error("You're not connected to baseSepolia");
        return;
      }

      try {
        const estimatedGas = await contract.createProperty.estimateGas(
          name,
          location,
          tokenId
        );

        const tx = await contract.createProperty(name, location, tokenId, {
          gasLimit: (estimatedGas * BigInt(120)) / BigInt(100),
        });

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          toast.success("Property created successfully");
          return;
        }

        toast.error("Failed to create Property");
        return;
      } catch (error) {
        const errorDecoder = ErrorDecoder.create();
        const decodedError = errorDecoder.decode(error);

        console.error("Error from Property creation", decodedError);
        toast.error((await decodedError).reason);
      }
    },
    [contract, address, chainId]
  );
};

export default useCreateProperty;

