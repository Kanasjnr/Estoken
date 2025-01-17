import { useState } from 'react';
import { useContract } from './useContract';

export const useUnlistTokens = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const contract = useContract();

  const unlistTokens = async (propertyId, amount) => {
    setLoading(true);
    setError(null);

    try {
      const tx = await contract.unlistTokens(propertyId, amount);
      await tx.wait();
    } catch (err) {
      setError("Error unlisting tokens");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { unlistTokens, loading, error };
};
