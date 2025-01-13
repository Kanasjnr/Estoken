import { useState, useEffect } from 'react';
import { Contract } from 'ethers';
import useSignerOrProvider from './useSignerOrProvider';

const useContractInstance = (address, abi) => {
  const [contract, setContract] = useState(null);
  const { signer, provider, readOnlyProvider } = useSignerOrProvider();

  useEffect(() => {
    if (address && abi) {
      const contractProvider = signer || provider || readOnlyProvider;
      const contractInstance = new Contract(address, abi, contractProvider);
      setContract(contractInstance);
    }
  }, [address, abi, signer, provider, readOnlyProvider]);

  return contract;
};

export default useContractInstance;

