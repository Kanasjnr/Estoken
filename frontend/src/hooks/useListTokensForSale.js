import { useState } from 'react';
import { useContract } from './useContract';

export const useListTokensForSale = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const contract = useContract();

  const listTokensForSale = async (propertyId, amount, price) => {
    setLoading(true);
    setError(null);

    try {
      const tx = await contract.listTokensForSale(propertyId, amount, price);
      await tx.wait();
    } catch (err) {
      setError("Error listing tokens for sale");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { listTokensForSale, loading, error };
};
