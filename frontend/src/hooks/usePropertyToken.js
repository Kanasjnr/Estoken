import { useCallback } from "react";
import useContractInstance from "./useContract";
import { useAppKitAccount } from "@reown/appkit/react";
import { toast } from "react-toastify";
import { ErrorDecoder } from "ethers-decode-error";

const usePropertyToken = () => {
  const contract = useContractInstance("PropertyToken");
  const { address } = useAppKitAccount();

  const mint = useCallback(
    async (amount, data) => {
      if (!amount) {
        toast.error("Amount is required");
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
        const estimatedGas = await contract.mint.estimateGas(
          address,
          amount,
          data
        );

        const tx = await contract.mint(address, amount, data, {
          gasLimit: (estimatedGas * BigInt(120)) / BigInt(100),
        });

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          toast.success("Tokens minted successfully");
          return;
        }

        toast.error("Failed to mint tokens");
      } catch (error) {
        const errorDecoder = ErrorDecoder.create();
        const decodedError = errorDecoder.decode(error);

        console.error("Error minting tokens", decodedError);
        toast.error((await decodedError).reason);
      }
    },
    [contract, address]
  );

  const balanceOf = useCallback(
    async (tokenId) => {
      if (!address) {
        toast.error("Please connect your wallet");
        return;
      }

      if (!contract) {
        toast.error("Contract not found");
        return;
      }

      try {
        const balance = await contract.balanceOf(address, tokenId);
        return balance;
      } catch (error) {
        console.error("Error fetching balance", error);
        toast.error("Failed to fetch balance");
      }
    },
    [contract, address]
  );

  return { mint, balanceOf };
};

export default usePropertyToken;
