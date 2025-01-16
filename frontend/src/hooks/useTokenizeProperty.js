import { useState } from 'react';
import { useContract } from './useContract'; 

export const useTokenizeProperty = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const contract = useContract();

  const tokenizeProperty = async (
    name,
    location,
    description,
    imageUrls,
    totalShares,
    pricePerShare
  ) => {
    setLoading(true);
    setError(null);

    try {
      const tx = await contract.tokenizeProperty(name, location, description, imageUrls, totalShares, pricePerShare);
      await tx.wait(); // Wait for the transaction to be mined
    } catch (err) {
      setError("Error tokenizing property");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { tokenizeProperty, loading, error };
};
