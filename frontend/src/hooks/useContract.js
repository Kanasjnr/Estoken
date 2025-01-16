import { useState, useEffect } from 'react';
import { Contract } from 'ethers';
import useSignerOrProvider from './useSignerOrProvider';

const useContract = (address, abi) => {
  const [contract, setContract] = useState(null);
  const [error, setError] = useState(null);
  const { signer, provider, readOnlyProvider } = useSignerOrProvider();

  useEffect(() => {
    if (address && abi) {
      try {
        const contractProvider = signer || provider || readOnlyProvider;
        const contractInstance = new Contract(address, abi, contractProvider);
        setContract(contractInstance);
        setError(null);
      } catch (err) {
        console.error("Error creating contract instance:", err);
        setError(err.message);
        setContract(null);
      }
    }
  }, [address, abi, signer, provider, readOnlyProvider]);

  return { contract, error };
};

export default useContract;