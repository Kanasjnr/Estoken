import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import useContract from './useContract';
import ABI from "../abis/RealEstateToken.json";

const useAllProperties = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { contract, error: contractError } = useContract(
    import.meta.env.VITE_APP_ESTOKEN_ADDRESS,
    ABI
  );

  useEffect(() => {
    const fetchAllProperties = async () => {
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
        setLoading(true);
        setError(null);

        const totalProperties = await contract.getTotalProperties();
        const total = Number(totalProperties.toString());

        const fetchedProperties = [];
        for (let i = 0; i < total; i++) {
          try {
            const data = await contract.getProperty(i);
            fetchedProperties.push({
              id: i,
              name: data[0],
              location: data[1],
              description: data[2],
              imageUrls: data[3],
              totalShares: data[4].toString(),
              pricePerShare: ethers.formatUnits(data[5], 18), // Convert wei to ETH
              accumulatedRentalIncomePerShare: ethers.formatUnits(data[6], 18),
              lastRentalUpdate: new Date(Number(data[7]) * 1000).toLocaleString(),
              isActive: data[8],
            });
          } catch (propertyError) {
            console.warn(`Error fetching property ${i}:`, propertyError);
          }
        }

        setProperties(fetchedProperties);
        setFilteredProperties(fetchedProperties);
      } catch (err) {
        console.error("Error fetching properties:", err);
        setError("Error fetching properties: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProperties();
  }, [contract, contractError]);

  const searchProperties = useCallback((searchTerm, filters) => {
    const filtered = properties.filter((property) => {
      const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            property.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLocation = filters.location === "" ||
                              property.location.toLowerCase().includes(filters.location.toLowerCase());
      
      const matchesMinPrice = filters.minPrice === "" ||
                              parseFloat(property.pricePerShare) >= parseFloat(filters.minPrice);
      
      const matchesMaxPrice = filters.maxPrice === "" ||
                              parseFloat(property.pricePerShare) <= parseFloat(filters.maxPrice);
      
      const matchesMinYield = filters.minYield === "" ||
                              parseFloat(property.accumulatedRentalIncomePerShare) >= parseFloat(filters.minYield);

      return matchesSearch && matchesLocation && matchesMinPrice && matchesMaxPrice && matchesMinYield;
    });

    setFilteredProperties(filtered);
  }, [properties]);

  return { properties: filteredProperties, loading, error, searchProperties };
};

export default useAllProperties;