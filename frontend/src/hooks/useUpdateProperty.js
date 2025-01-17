import { useState } from 'react';
import { useContract } from './useContract';

export const useUpdateProperty = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const contract = useContract();

  const updateProperty = async (
    propertyId,
    name,
    location,
    description,
    pricePerShare,
    isActive
  ) => {
    setLoading(true);
    setError(null);

    try {
      const tx = await contract.updateProperty(propertyId, name, location, description, pricePerShare, isActive);
      await tx.wait();
    } catch (err) {
      setError("Error updating property");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { updateProperty, loading, error };
};
