import { useState, useEffect } from "react";
import useContract from "./useContract";
import ABI from "../abis/RealEstateToken.json";

const useGetProperty = (propertyId) => {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { contract, error: contractError } = useContract(import.meta.env.VITE_APP_ESTOKEN_ADDRESS, ABI);

  useEffect(() => {
    if (!contract || contractError) {
      console.error("Contract not initialized or has an error");
      setError(contractError?.message || "Contract not initialized");
      setLoading(false);
      return;
    }

    if (!propertyId) {
      console.error("Property ID is undefined");
      setError("Property ID is undefined");
      setLoading(false);
      return;
    }

    const fetchProperty = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log("Fetching property info for ID:", propertyId);

        const info = await contract.getPropertyInfo(propertyId);
        const financials = await contract.getPropertyFinancials(propertyId);
        const availableShares = await contract.getAvailableShares(propertyId);

        console.log("Fetched property data successfully");
        setProperty({
          id: propertyId,
          name: info[0],
          location: info[1],
          description: info[2],
          imageUrls: Array.isArray(info[3]) ? info[3] : [], // Ensure images are an array
          totalShares: info[4]?.toString(),
          availableShares: availableShares?.toString(),
          pricePerShare: info[5]?.toString(),
          accumulatedRentalIncomePerShare: financials[0]?.toString(),
          lastRentalUpdate: new Date(Number(financials[1]) * 1000).toLocaleString(),
          isActive: financials[2],
        });
      } catch (err) {
        console.error("Error fetching property:", err);
        setError("Error fetching property: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId, contract, contractError]);

  return { property, loading, error };
};

export default useGetProperty;
