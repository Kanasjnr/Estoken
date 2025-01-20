import { useState, useEffect } from 'react';
import useContract from './useContract';
import ABI from "../abis/RealEstateToken.json";

const useGetProperty = (propertyId) => {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { contract, error: contractError } = useContract(import.meta.env.VITE_APP_ESTOKEN_ADDRESS, ABI);

  useEffect(() => {
    const fetchProperty = async () => {
      if (contractError) {
        setError(contractError);
        setLoading(false);
        return;
      }

      if (!contract) {
        setError("Contract not initialized");
        setLoading(false);
        return;
      }

      try {
        const data = await contract.getProperty(propertyId);
        setProperty({
          name: data[0],
          location: data[1],
          description: data[2],
          imageUrls: data[3],
          totalShares: data[4].toString(),
          pricePerShare: data[5].toString(),
          accumulatedRentalIncomePerShare: data[6].toString(),
          lastRentalUpdate: new Date(Number(data[7]) * 1000).toLocaleString(),
          isActive: data[8]
        });
      } catch (err) {
        setError("Error fetching property: " + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId, contract, contractError]);

  return { property, loading, error };
};

export default useGetProperty;