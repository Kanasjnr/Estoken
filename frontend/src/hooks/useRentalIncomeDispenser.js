import { useCallback } from "react";
import useContractInstance from "./useContract";
import { useAppKitAccount } from "@reown/appkit/react";
import { toast } from "react-toastify";
import { ErrorDecoder } from "ethers-decode-error";

const useRentalIncomeDispenser = () => {
  const contract = useContractInstance("RentalIncomeDispenser");
  const { address } = useAppKitAccount();

  const distributeRentalIncome = useCallback(
    async (tokenId, amount) => {
      if (!tokenId || !amount) {
        toast.error("Token ID and amount are required");
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
        const estimatedGas = await contract.distributeRentalIncome.estimateGas(tokenId, { value: amount });

        const tx = await contract.distributeRentalIncome(tokenId, {
          value: amount,
          gasLimit: (estimatedGas * BigInt(120)) / BigInt(100),
        });

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          toast.success("Rental income distributed successfully");
          return;
        }

        toast.error("Failed to distribute rental income");
      } catch (error) {
        const errorDecoder = ErrorDecoder.create();
        const decodedError = errorDecoder.decode(error);

        console.error("Error distributing rental income", decodedError);
        toast.error((await decodedError).reason);
      }
    },
    [contract, address]
  );

  const claimIncome = useCallback(
    async (tokenId) => {
      if (!tokenId) {
        toast.error("Token ID is required");
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
        const estimatedGas = await contract.claimIncome.estimateGas(tokenId);

        const tx = await contract.claimIncome(tokenId, {
          gasLimit: (estimatedGas * BigInt(120)) / BigInt(100),
        });

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          toast.success("Income claimed successfully");
          return;
        }

        toast.error("Failed to claim income");
      } catch (error) {
        const errorDecoder = ErrorDecoder.create();
        const decodedError = errorDecoder.decode(error);

        console.error("Error claiming income", decodedError);
        toast.error((await decodedError).reason);
      }
    },
    [contract, address]
  );

  const getUnclaimedIncome = useCallback(
    async (tokenId) => {
      if (!tokenId) {
        toast.error("Token ID is required");
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
        const unclaimedIncome = await contract.getUnclaimedIncome(tokenId, address);
        return unclaimedIncome;
      } catch (error) {
        console.error("Error fetching unclaimed income", error);
        toast.error("Failed to fetch unclaimed income");
      }
    },
    [contract, address]
  );

  return { distributeRentalIncome, claimIncome, getUnclaimedIncome };
};

export default useRentalIncomeDispenser;

