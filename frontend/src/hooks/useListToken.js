import { useState } from 'react';
import useContract from './useContract';
import ABI from "../abis/RealEstateToken.json";

const useListTokens = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { contract } = useContract(import.meta.env.VITE_APP_ESTOKEN_ADDRESS, ABI);

  const listTokens = async (propertyId, amount, price) => {
    if (!contract) {
      setError("Contract not initialized");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tx = await contract.listTokensForSale(propertyId, amount, price);
      await tx.wait();
      return true;
    } catch (err) {
      setError("Error listing tokens: " + err.message);
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { listTokens, loading, error };
};

export default useListTokens;