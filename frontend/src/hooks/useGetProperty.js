import { useState, useEffect } from 'react';
import { useContract } from './useContract';

export const useGetProperty = (propertyId) => {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const contract = useContract();

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const data = await contract.getProperty(propertyId);
        setProperty(data);
      } catch (err) {
        setError("Error fetching property");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId, contract]);

  return { property, loading, error };
};
