import { useState } from 'react';
import { useContract } from './useContract';

export const useClaimRentalIncome = (propertyId) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const contract = useContract();

  const claimRentalIncome = async () => {
    setLoading(true);
    setError(null);

    try {
      const tx = await contract.claimRentalIncome(propertyId);
      await tx.wait();
    } catch (err) {
      setError("Error claiming rental income");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { claimRentalIncome, loading, error };
};
