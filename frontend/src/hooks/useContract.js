import { useMemo } from "react";
import useSignerOrProvider from "./useSignerOrProvider";
import { Contract } from "ethers";
import CONTRACT_ABI from "../abis/RealEstateToken.json";

const useContractInstance = (withSigner = false) => {
  const { signer, readOnlyProvider } = useSignerOrProvider();
  return useMemo(() => {
    if (withSigner) {
      if (!signer) return null;
      return new Contract(import.meta.VITE_APP_ESTOKEN_ADDRESS, CONTRACT_ABI, signer);
    } else {
      return new Contract(
        CONTRACT_ABI.address,
        CONTRACT_ABI.abi,
        readOnlyProvider
      );
    }
  }, [signer, readOnlyProvider, withSigner]);
};

export default useContractInstance;